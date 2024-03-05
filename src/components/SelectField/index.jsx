import SelectInput from "../SelectInput";
import "./index.scss";

const SelectField = ({
  hint,
  label,
  error,
  className = "",
  icon: Icon,
  inputProps = {},
}) => {
  return (
    <div className={`dg-select-field ${className} `}>
      {label && <label>{label}</label>}

      <SelectInput error={error} icon={Icon} {...inputProps} />

      {hint && <span className="dg-select-field-hint">{hint}</span>}

      {error && <span className="dg-select-field-error">{error}</span>}
    </div>
  );
};

export default SelectField;
