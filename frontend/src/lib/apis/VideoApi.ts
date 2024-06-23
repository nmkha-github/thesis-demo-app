import axios from "axios";
import ActionPredictInterface from "../interfaces/ActionPredictInterface";

const VideoApi = {
    actionPredict: async (file: File): Promise<ActionPredictInterface> =>{
        const formData = new FormData();
        formData.append("file", file);

        const actionPredictResponse = await axios.post(process.env.REACT_APP_BACKEND_HOST + "/action-predict", formData);

        return actionPredictResponse.data;
    }
}


export default VideoApi