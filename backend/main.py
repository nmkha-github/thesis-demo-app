from utils.video_utils import _frame_from_video
from utils.zeroshot_classification import ZeroshotClassification
from flask import Flask, request, jsonify
import cv2
import tempfile
import warnings

warnings.filterwarnings("ignore", category=DeprecationWarning)

app = Flask(__name__)


@app.route("/")
def home():
    return "Home"


@app.route("/action-predict", methods=["POST"])
def predict():
    # Check if the post request has the file part
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    # If the user does not select a file, the browser may submit an empty part without a filename
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    print(file.filename)
    if file:
        # Check if the file is a video file (basic check using filename extension)
        if not file.filename.lower().endswith((".mp4", ".avi", ".mov", ".mkv")):
            return jsonify({"error": "File is not a video"}), 400

        # Create a temporary file and write the uploaded video data to it
        with tempfile.NamedTemporaryFile(delete=False) as temp_video:
            temp_video.write(file.read())
            temp_video_path = temp_video.name

        # Decode the byte array to an OpenCV video capture object
        video = cv2.VideoCapture(temp_video_path)
        if not video.isOpened():
            return jsonify({"error": "Could not open video file"}), 500

        frames = [x for x in _frame_from_video(video)]
        probs, action_predict_index = classification.predict(frames)

        probs_dict = {}
        for index, action in enumerate(actions):
            probs_dict[action] = probs[0][index].item()

        # Return the result as JSON
        return jsonify(
            {
                "predict": actions[action_predict_index.item()],
                "probabilities": probs_dict,
            }
        )


if __name__ == "__main__":
    actions = [
        "put hand near socket",
        "near knife",
        "near kettle",
        "put small object to mouth",
        "sleep",
        "running",
        "sitting",
        "swimming",
        "drowning",
        "fall",
        "eating",
        "smile",
        "choke",
        "bleeding",
    ]

    print("Model loading...")
    classification = ZeroshotClassification(actions)

    app.run()
