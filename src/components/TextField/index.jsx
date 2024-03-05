import "./index.scss";
import TextInput from "../TextInput";

const TextField = ({
  hint,
  label,
  error,
  className = "",
  iconAfter: IconAfter,
  iconBefore: IconBefore,
  inputProps = {},
  ...rest
}) => {
  const inputContainerClasses = () => {
    let classes = "dg-field-input ";

    if (IconAfter) classes += "dg-field-input--icon-after ";
    if (IconBefore) classes += "dg-field-input--icon-before ";
    if (error) classes += "dg-field-input--error ";

    return classes;
  };

  return (
    <div className={`dg-text-field ${className} `} {...rest}>
      {label && <label>{label}</label>}
      <div className={inputContainerClasses()}>
        {IconBefore && <IconBefore />}

        <TextInput error={error} {...inputProps} />

        {IconAfter && <IconAfter />}
      </div>
      {hint && <span className="dg-text-field-hint">{hint}</span>}
      {error && <span className="dg-text-field-error">{error}</span>}
    </div>
  );
};

export default TextField;
