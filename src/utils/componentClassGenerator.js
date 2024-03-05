const styleClass = (props = [], prefix) =>
  props.map((item) => `${prefix}-${item}`).join(" ");

export default styleClass;
