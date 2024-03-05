import React from "react";
import { Modal } from "react-responsive-modal";
import "./index.scss";
import "react-responsive-modal/styles.css";
import { X } from "react-feather";

const BaseModal = ({
  handleClose,
  className = "",
  showCloseIcon,
  size = "medium",
  children,
  closeOnEsc = true,
  noPadding,
  noOverflow,
  fromBottom,
  fromLeft,
  ...rest
}) => {
  return (
    <Modal
      open
      onClose={handleClose}
      center
      showCloseIcon={false}
      classNames={{
        modalAnimationIn: fromLeft ? "slideIn" : "",
        modalContainer: fromLeft ? "dg-base-modal-container__left" : "",
        modal: `${className} dg-base-modal dg-base-modal__${size}
                ${noPadding ? "no-padding" : ""} 
                ${fromBottom ? "dg-base-modal__from-bottom" : ""} 
                ${fromLeft ? "dg-base-modal__from-left" : ""}
                ${noOverflow ? "dg-base-modal__no-overflow" : ""} `,
      }}
      closeOnEsc={closeOnEsc}
      {...rest}
    >
      {showCloseIcon && (
        <X className="dg-base-modal__icon" onClick={handleClose} />
      )}
      {children}
    </Modal>
  );
};

export default BaseModal;
