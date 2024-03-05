import "./index.scss";

const TextInput = ({
  value,
  onChange,
  placeholder = "",
  className = "",
  error,
  ...rest
}) => {
  const handleChange = (e) => {
    onChange && onChange(e);
  };

  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={handleChange}
      className={`dg-text-input ${
        error ? "dg-text-input-error" : ""
      } ${className}`}
      {...rest}
    />
  );
};

export default TextInput;
