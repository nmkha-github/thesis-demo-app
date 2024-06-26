import os, sys
import torch
import numpy as np
from .video_utils import frame_preprocess, frames2tensor, resize_frames


class ZeroshotClassification:
    def __init__(self, class_names):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.class_names = class_names
        self.model, self.tokenizer = self.get_model_and_tokenizer()
        self.class_name_feature = self.get_text_feature(class_names)

    def get_model_and_tokenizer(self):
        sys.path.append(os.path.join(os.getcwd(), "model/BLIP_2"))
        from model.BLIP_2.BLIP_2 import BLIP_2
        from model.BLIP_2.simple_tokenizer import SimpleTokenizer

        tokenizer = SimpleTokenizer()
        BLIP_2_model = BLIP_2(
            tokenizer,
            pretrain=os.path.join(
                os.getcwd(),
                "saved_model/BLIP_2.pth",
            ),
        )
        return BLIP_2_model, tokenizer

    def get_text_feature(self, list_text):
        with torch.no_grad():
            text_feat_d = {}
            for text in list_text:
                feature = self.model.get_text_features(
                    text, self.tokenizer, text_feat_d
                )
                text_feat_d[text] = feature
            return torch.cat([text_feat_d[text] for text in list_text], 0).to(
                self.device
            )

    def predict(self, opencv_frames_list):
        with torch.no_grad():
            self.model.eval()
            self.model = self.model.to(self.device)
            frames_tensor = frames2tensor(opencv_frames_list)
            video_feature = self.model.get_vid_features(frames_tensor)
            prob = self.model.get_predict_label(video_feature, self.class_name_feature)
            predict_action = torch.argmax(prob)
            torch.cuda.empty_cache()
            return prob, predict_action


# class_names = [
#     "put hand near socket",
#     "near knife",
#     "near kettle",
#     "put small object to mouth",
#     "running",
#     "sitting",
#     "swimming",
#     "drowning",
#     "fall",
#     "eating",
#     "smile",
#     "choke",
#     "bleeding",
# ]
