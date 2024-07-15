import axios from "axios";
import ActionPredictInterface from "../interfaces/ActionPredictInterface";
import DangerPredictInterface from "../interfaces/DangerPredictInterface";

const VideoApi = {
  actionPredict: async (file: File): Promise<ActionPredictInterface> => {
    const formData = new FormData();
    formData.append("file", file);

    const actionPredictResponse = await axios.post(
      process.env.REACT_APP_BACKEND_HOST + "/action-predict",
      formData
    );

    return actionPredictResponse.data;
  },

  dangerPredict: async (
    file: File,
    threshold = 0.5
  ): Promise<DangerPredictInterface> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("threshold", threshold.toString());
    const actionPredictResponse = await axios.post(
      process.env.REACT_APP_BACKEND_HOST + "/danger-predict",
      formData
    );

    return actionPredictResponse.data;
  },

  visualization: async (file: File, action: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("action", action);
    const visualizationResponse = await axios.post(
      process.env.REACT_APP_BACKEND_HOST + "/visualize",
      formData,
      {
        responseType: "blob", // Ensure the response is treated as a Blob
      }
    );

    return visualizationResponse.data;
  },

  poseExtraction: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const visualizationResponse = await axios.post(
      process.env.REACT_APP_BACKEND_HOST + "/pose",
      formData,
      {
        responseType: "blob", // Ensure the response is treated as a Blob
      }
    );

    return visualizationResponse.data;
  },
};

export default VideoApi;
