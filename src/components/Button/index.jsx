import React, { forwardRef } from "react";
import "./index.scss";
import Spinner from "../Spinner";
import styleClass from "../../utils/componentClassGenerator";

const Button = forwardRef(
  (
    {
      variant = "primary",
      type = "button",
      size = "regular",
      onClick,
      className = "",
      children,
      iconAfter: IconAfter,
      iconBefore: IconBefore,
      loading,
      ...rest
    },
    ref
  ) => {
    const styles = styleClass([variant, size], "dg-button");
    return (
      <button
        ref={ref}
        className={`dg-button ${className} ${styles}`}
        type={type}
        onClick={onClick}
        {...rest}
      >
        {loading && <Spinner width="14" height="14" weight="2" />}
        {IconBefore && !loading ? <IconBefore /> : null}

        {children}

        {IconAfter && <IconAfter />}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
