import React from "react";
import "./index.scss";

const TextArea = ({ className, error, ...rest }) => {
  return (
    <textarea
      className={`cg-text-area ${
        error ? "cg-textarea-error" : ""
      } ${className}`}
      {...rest}
    ></textarea>
  );
};

export default TextArea;
