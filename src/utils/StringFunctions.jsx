const truncateLabel = (label) => {
  return label.length > (showPercentage ? labelLengthH : labelLengthV) ? `${label.substring(0, (showPercentage ? labelLengthH : labelLengthV))}...` : label;
};

export default truncateLabel;