from utils.visualization import Visualization
from utils.danger_classification import DangerClassification
from utils.video_utils import _frame_from_video, generate_frames
from utils.zeroshot_classification import ZeroshotClassification
from flask import Flask, Response, request, jsonify, send_file
from flask_cors import CORS
import numpy as np
import cv2
import tempfile
import warnings

warnings.filterwarnings("ignore", category=DeprecationWarning)

num_request = 0
app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return "Home"


@app.route("/action-predict", methods=["POST"])
def action_predict():
    # Check if the post request has the file part
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    # If the user does not select a file, the browser may submit an empty part without a filename
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

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

        probs, action_predict_index = action_classification.predict(frames)

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


@app.route("/danger-predict", methods=["POST"])
def danger_predict():
    # Check if the post request has the file part
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    threshold = float(request.form.get("threshold"))
    print("threshold: ", threshold)

    # If the user does not select a file, the browser may submit an empty part without a filename
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

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
        fps = int(video.get(cv2.CAP_PROP_FPS))
        if not video.isOpened():
            return jsonify({"error": "Could not open video file"}), 500
        frames = [x for x in _frame_from_video(video)]
        print("Total frame: ", len(frames))
        print("fps: ", video.get(cv2.CAP_PROP_FPS))
        danger_segment = danger_classification.predict(frames, threshold, skip=fps)

        return jsonify(
            {
                "danger_segment": danger_segment,
            }
        )


@app.route("/visualize", methods=["POST"])
def visualize():
    # Check if the post request has the file part
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    action = request.form.get("action")

    # If the user does not select a file, the browser may submit an empty part without a filename
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

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
        fps = int(video.get(cv2.CAP_PROP_FPS))
        if not video.isOpened():
            return jsonify({"error": "Could not open video file"}), 500
        frames = [x for x in _frame_from_video(video)]

        frame_visualize_list = []
        frame_per_process = 2
        visualize_frames = []
        for i in range(len(frames) // fps // frame_per_process):
            process_frames = []
            for j in range(frame_per_process):
                if i * fps * frame_per_process + j * fps < len(frames):
                    process_frames.append(frames[i * fps * frame_per_process + j * fps])
                    frame_visualize_list.append(i * fps * frame_per_process + j * fps)
            visualize_frames += visualization.visualize(process_frames, action)

        frame_height, frame_width, _ = visualize_frames[0].shape

        out = cv2.VideoWriter(
            "output.webm",
            cv2.VideoWriter_fourcc(*"VP90"),
            1,
            (frame_width, frame_height),
        )

        for frame in visualize_frames:
            out.write((frame * 255).astype(np.uint8))

        out.release()

        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_video:
            video_path = temp_video.name
            out = cv2.VideoWriter(
                video_path,
                cv2.VideoWriter_fourcc(*"VP90"),
                1,
                (frame_width, frame_height),
            )

            for frame in visualize_frames:
                out.write((frame * 255).astype(np.uint8))

            out.release()

            return send_file(video_path, as_attachment=True)


if __name__ == "__main__":
    danger_actions = [
        "put hand near socket",
        "near knife",
        "near kettle",
        "put small object to mouth",
        "drowning",
        "burn",
        "fall",
        "choke",
        "bleeding",
        "injured",
    ]
    safe_actions = [
        "sleep",
        "sitting",
        "swimming",
        "eating",
        "running",
        "smile",
        "crying",
    ]
    actions = danger_actions + safe_actions

    print(">>>>>>>>>>>>>>Model loading<<<<<<<<<<<<<<<<<<<")
    action_classification = ZeroshotClassification(actions)
    danger_classification = DangerClassification(danger_actions, safe_actions)
    visualization = Visualization()
    print(">>>>>>>>>>>>>>Done load model<<<<<<<<<<<<<<<<<<")

    app.run()
