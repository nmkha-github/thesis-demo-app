import torch
import torch.nn as nn
from lavis.models import load_model_and_preprocess


class BLIP2_Danger(nn.Module):
    def __init__(self):
        super(BLIP2_Danger, self).__init__()
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model, vis_processors, text_processors = load_model_and_preprocess(
            name="blip2_image_text_matching",
            model_type="pretrain",
            is_eval=True,
            device=self.device,
        )
        for param in model.parameters():
            param.requires_grad = False

        self.preprocess = vis_processors["eval"]
        self.extract_features = model.extract_features
        self.danger_classify = nn.Sequential(
            nn.Linear(256, 512),
            nn.ReLU(),
            nn.Dropout(p=0.5),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(p=0.5),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(p=0.5),
            nn.Linear(128, 1),
            nn.Sigmoid(),
        )

    def forward(self, batch_pil_image: torch.Tensor):
        x = (
            self.extract_features(
                {"image": batch_pil_image, "text_input": []}, mode="image"
            )
            .image_embeds_proj[:, 0]
            .to(self.device)
        )

        x = self.danger_classify(x)
        return x
