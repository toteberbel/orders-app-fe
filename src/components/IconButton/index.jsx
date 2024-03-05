import React, { forwardRef } from "react";
import "./index.scss";
import styleClass from "../../utils/componentClassGenerator";

const IconButton = forwardRef(
  (
    {
      variant = "primary",
      type = "button",
      size = "regular",
      onClick,
      className = "",
      icon: Icon,
      ...rest
    },
    ref
  ) => {
    const styles = styleClass([variant, size], "dg-icon-button");
    return (
      <button
        className={`dg-icon-button ${className} ${styles}`}
        type={type}
        onClick={onClick}
        ref={ref}
        {...rest}
      >
        <Icon />
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;
