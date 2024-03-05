import React from "react";
import "./index.scss";
import TextArea from "../TextArea";

const TextAreaField = ({
  hint,
  label,
  error,
  className = "",
  inputProps = {},
}) => {
  return (
    <div className={`dg-textarea-field ${className} `}>
      {label && <label>{label}</label>}

      <TextArea error={error} {...inputProps} />

      {hint && <span className="dg-textarea-field-hint">{hint}</span>}
      {error && <span className="dg-textarea-field-error">{error}</span>}
    </div>
  );
};

export default TextAreaField;
