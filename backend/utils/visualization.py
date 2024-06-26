from matplotlib import pyplot as plt
import numpy as np
import cv2
from PIL import Image
from lavis.models import load_model_and_preprocess
import torch
from scipy.ndimage import filters
from skimage import transform as skimage_transform


def getAttMap(img, attMap, blur=True, overlap=True):
    attMap -= attMap.min()
    if attMap.max() > 0:
        attMap /= attMap.max()

    attMap = skimage_transform.resize(attMap, (img.shape[:2]), order=3, mode="constant")
    if blur:
        attMap = filters.gaussian_filter(attMap, 0.02 * max(img.shape[:2]))
        attMap -= attMap.min()
        attMap /= attMap.max()
    cmap = plt.get_cmap("jet")
    attMapV = cmap(attMap)
    attMapV = np.delete(attMapV, 3, 2)
    if overlap:
        attMap = (
            1 * (1 - attMap**0.7).reshape(attMap.shape + (1,)) * img
            + (attMap**0.7).reshape(attMap.shape + (1,)) * attMapV
        )
    return attMap


def compute_gradcam(model, visual_input, text_input, tokenized_text, block_num=6):
    model.text_encoder.base_model.base_model.encoder.layer[
        block_num
    ].crossattention.self.save_attention = True

    output = model({"image": visual_input, "text_input": text_input}, match_head="itm")
    loss = output[:, 1].sum()

    model.zero_grad()
    loss.backward()
    with torch.no_grad():
        mask = tokenized_text.attention_mask.view(
            tokenized_text.attention_mask.size(0), 1, -1, 1, 1
        )  # (bsz,1,token_len, 1,1)
        token_length = tokenized_text.attention_mask.sum(dim=-1) - 2
        token_length = token_length.cpu()
        # grads and cams [bsz, num_head, seq_len, image_patch]
        grads = model.text_encoder.base_model.base_model.encoder.layer[
            block_num
        ].crossattention.self.get_attn_gradients()
        cams = model.text_encoder.base_model.base_model.encoder.layer[
            block_num
        ].crossattention.self.get_attention_map()

        # assume using vit with 576 num image patch
        cams = cams[:, :, :, 1:].reshape(visual_input.size(0), 12, -1, 24, 24) * mask
        grads = (
            grads[:, :, :, 1:].clamp(0).reshape(visual_input.size(0), 12, -1, 24, 24)
            * mask
        )

        gradcams = cams * grads
        gradcam_list = []
        for ind in range(visual_input.size(0)):
            token_length_ = token_length[0]
            gradcam = gradcams[ind].mean(0).cpu().detach()
            # [enc token gradcam, average gradcam across token, gradcam for individual token]
            gradcam = torch.cat(
                (
                    gradcam[0:1, :],
                    gradcam[1 : token_length_ + 1, :].sum(dim=0, keepdim=True)
                    / token_length_,
                    gradcam[1:, :],
                )
            )
            gradcam_list.append(gradcam)

    return gradcam_list, output


class Visualization:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model, self.vis_processors, self.text_processors = (
            load_model_and_preprocess(
                "blip_image_text_matching", "large", device=self.device, is_eval=True
            )
        )

    def image_normalize(self, pil_image):
        dst_w = 720
        w, h = pil_image.size
        scaling_factor = dst_w / w

        resized_img = pil_image.resize(
            (int(w * scaling_factor), int(h * scaling_factor))
        )
        norm_img = np.float32(resized_img) / 255
        return norm_img

    def visualize(self, opencv_frames_list, text):
        torch.cuda.empty_cache()
        norm_images = [
            self.image_normalize(Image.fromarray(cv2.cvtColor(x, cv2.COLOR_BGR2RGB)))
            for x in opencv_frames_list
        ]
        pil_frames = [
            self.vis_processors["eval"](
                Image.fromarray(cv2.cvtColor(x, cv2.COLOR_BGR2RGB))
            )
            for x in opencv_frames_list
        ]
        tensor_frames = torch.stack(pil_frames, dim=0).to(self.device)

        txt = self.text_processors["eval"](text)
        txt_tokens = self.model.tokenizer(txt, return_tensors="pt").to(self.device)
        gradcam, _ = compute_gradcam(
            self.model, tensor_frames, txt, txt_tokens, block_num=7
        )
        text_gradcam = [x[1].to(self.device) for x in gradcam]
        avg_gradcam = [
            getAttMap(image, text_gradcam[i].cpu().numpy(), blur=False)
            for i, image in enumerate(norm_images)
        ]
        torch.cuda.empty_cache()
        return avg_gradcam
