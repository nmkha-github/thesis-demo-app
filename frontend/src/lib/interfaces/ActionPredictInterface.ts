interface ActionPredictInterface{
    predict: string;
    probabilities:  {
        [key: string]: number;
      };
}

export default ActionPredictInterface;