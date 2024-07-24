import mediapipe as mp
import numpy as np
import cv2

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5, min_tracking_confidence=0.5, model_complexity=0)
mp_drawing = mp.solutions.drawing_utils

def extract_pose(video):
    pose_frames = []
    while True:
        ret, frame = video.read()
        if not ret:
            break

        # Resize frame to 224x224 for processing (assuming aspect ratio is maintained)
        resized_frame = cv2.resize(frame, (224, 224))

        # Process the resized frame with MediaPipe
        results = pose.process(resized_frame)

        if results.pose_landmarks:
            # Draw pose landmarks on the resized frame
            annotated_frame = resized_frame.copy()
            mp_drawing.draw_landmarks(
                annotated_frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

            # Resize annotated frame back to original size
            original_size_frame = cv2.resize(annotated_frame, (frame.shape[1], frame.shape[0]))
            pose_frames.append(original_size_frame)
        else:
            # If no landmarks found, use original frame
            pose_frames.append(frame)

    video.release()
    return pose_frames