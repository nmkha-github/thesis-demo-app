import os
from model.BLIP_2_danger.model import BLIP2_Danger
import torch
from PIL import Image
import cv2
import time


class DangerClassification:
    def __init__(self, danger_actions, safe_actions):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.danger_actions = danger_actions
        self.actions = danger_actions + safe_actions
        self.model = BLIP2_Danger()
        self.model.load_state_dict(
            torch.load(
                os.path.join(
                    os.getcwd(),
                    "saved_model/BLIP_2_danger.pth",
                )
            )
        )
        self.actions_features = (
            self.model.extract_features({"text_input": self.actions}, mode="text")
            .text_embeds_proj[:, 0]
            .to(self.device)
        )

    def danger_action_check(self, batch_image):
        image_features = (
            self.model.extract_features({"image": batch_image}, mode="image")
            .image_embeds_proj[:, 0]
            .to(self.device)
        )
        sim = (image_features @ self.actions_features.t()) / 0.0249
        predict_action = torch.argmax(sim, dim=1)
        return predict_action < len(self.danger_actions), predict_action

    def predict(self, opencv_frames_list, threshold=0.5, skip=32):
        with torch.no_grad():
            start_time = time.time()
            self.model.eval()
            self.model = self.model.to(self.device)
            #
            frames = [
                self.model.preprocess(
                    Image.fromarray(cv2.cvtColor(x, cv2.COLOR_BGR2RGB))
                )
                for x in opencv_frames_list[0::skip]
            ]
            tensor_frames = torch.stack(frames, dim=0).to(self.device)
            print("Process shape: ", tensor_frames.shape)
            print("--- preprocess %s seconds ---" % (time.time() - start_time))

            start_time = time.time()
            danger_predict = self.model(tensor_frames)
            print("--- danger predict %s seconds ---" % (time.time() - start_time))

            # start_time = time.time()
            # danger_actions, predict_actions = self.danger_action_check(tensor_frames)
            # print("--- action predict %s seconds ---" % (time.time() - start_time))

            #
            start_time = time.time()
            danger_frame_index_list = []
            for i, danger_prob in enumerate(danger_predict):
                # is_danger = (danger_prob > threshold) or (danger_actions[i])
                is_danger = danger_prob > threshold
                if is_danger:
                    index = i * skip
                    for j in range(index, index + skip):
                        if j >= len(opencv_frames_list):
                            break
                        danger_frame_index_list.append(j)
            danger_segment = []
            start_frame = -1
            end_frame = -1
            for i, frame in enumerate(danger_frame_index_list):
                if i == 0:
                    start_frame = frame
                    end_frame = frame
                    continue
                if frame == danger_frame_index_list[i - 1] + 1:
                    end_frame = frame
                if frame != danger_frame_index_list[i - 1] + 1:
                    danger_segment.append(
                        {"start": start_frame / skip, "end": end_frame / skip}
                    )
                    start_frame = frame
                    end_frame = frame
            if start_frame != -1:
                danger_segment.append(
                    {"start": start_frame / skip, "end": end_frame / skip}
                )
            print("--- union %s seconds ---" % (time.time() - start_time))
        torch.cuda.empty_cache()
        # return danger_frame_index_list, [self.actions[x] for x in predict_actions]
        return danger_segment
