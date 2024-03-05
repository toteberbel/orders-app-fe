import { Trash2 } from "react-feather";
import IconButton from "../IconButton";
import "./index.scss";
import SelectField from "../SelectField";
import { useMemo } from "react";
import TextField from "../TextField";

const mainClass = "product";

const units = [
  {
    label: "kg",
    value: "kg",
  },
  {
    label: "gr",
    value: "gr",
  },
  {
    label: "lt",
    value: "lt",
  },
  {
    label: "ml",
    value: "ml",
  },
  {
    label: "unit",
    value: "unit",
  },
];

const Product = ({ product, onDelete, options, onChange }) => {
  const selectedOption = useMemo(
    () => options.find((option) => option.value === product.type) || null,
    [options, product.type]
  );

  const selectedUnit = useMemo(
    () => units.find((unit) => unit.value === product.unit) || null,
    [units, product.unit]
  );

  const handleChange = (value, field) => {
    onChange({ ...product, [field]: value });
  };

  return (
    <div className={mainClass}>
      <SelectField
        inputProps={{
          options,
          value: selectedOption,
          onChange: (e) => handleChange(e.value, "type"),
        }}
      />
      <div className={mainClass + "__quantity-field"}>
        <TextField
          inputProps={{
            value: product.quantity,
            type: "number",
            min: 1,
            onChange: (e) => handleChange(e.target.value, "quantity"),
          }}
        />
        <SelectField
          inputProps={{
            options: units,
            value: selectedUnit,
            onChange: (e) => handleChange(e.value, "unit"),
          }}
        />
      </div>

      <div className={mainClass + "__actions"}>
        <IconButton
          variant="secondary"
          icon={Trash2}
          onClick={() => onDelete(product.id, product.isNew)}
        />
      </div>
    </div>
  );
};

export default Product;
