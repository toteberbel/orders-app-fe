import { useEffect, useMemo, useState } from "react";
import SelectField from "../SelectField";
import TextField from "../TextField";
import "./index.scss";
import Button from "../Button";
import { Plus, Save } from "react-feather";
import Product from "../Product";
import BaseModal from "../BaseModal";
import axios from "axios";
import { environment } from "../../../config/env";
import TextAreaField from "../TextAreaField";
import toast from "react-hot-toast";

const mainClass = "new-order";

const initialValues = {
  customerName: "",
  delivery: "",
  notes: "",
  products: {},
};

const NewOrder = ({ orderToEdit, handleClose, deliveries, onCreate }) => {
  const [order, setOrder] = useState(orderToEdit || initialValues);
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const [showSaveButton, setShowSaveButton] = useState(false);

  useEffect(() => {
    getProductTypes();
  }, []);

  const getProductTypes = async () => {
    try {
      const response = await axios.get(environment.apiUrl + "/products");

      setProductTypes(
        response.data.map((productType) => ({
          label: productType.type,
          value: productType.id,
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const onAddNewProdcut = () => {
    const newId = crypto.randomUUID();
    setOrder({
      ...order,
      products: {
        ...order.products,
        [newId]: {
          isNew: true,
          id: newId,
          type: productTypes[0].value,
          unit: "kg",
          quantity: 1,
        },
      },
    });

    setShowSaveButton(true);
  };

  const onRemoveProduct = async (id, isNew) => {
    if (!isNew) {
      try {
        await axios.delete(environment.apiUrl + `/order-items/${id}`);
      } catch (error) {
        console.error(error);
        toast.error("Error deleting product");
      }
    }

    const originalProducts = { ...order.products };
    delete originalProducts[id];
    setOrder({
      ...order,
      products: originalProducts,
    });
    setShowSaveButton(true);
  };

  const productsToRender = useMemo(
    () => Object.keys(order.products).map((key) => order.products[key]),
    [order.products]
  );

  const selecteDelivery = useMemo(
    () =>
      deliveries.find((delivery) => delivery.value === order.delivery) || null,
    [order, deliveries]
  );

  const onChange = (value, name) => {
    setOrder({
      ...order,
      [name]: value,
    });
    setShowSaveButton(true);
  };

  const onChangeProduct = (productId, newValues) => {
    setOrder({
      ...order,
      products: {
        ...order.products,
        [productId]: newValues,
      },
    });
    setShowSaveButton(true);
  };

  const validateOrder = () => {
    const validationErrors = {};

    if (!order.customerName) {
      validationErrors.customerName = "Customer name is required";
    }

    if (!order.delivery) {
      validationErrors.delivery = "Delivery is required";
    }

    if (Object.keys(order.products).length === 0 && !order.notes) {
      validationErrors.empty = "At least one product or one note is required";
    }

    const productWithZeroQuantity = Object.keys(order.products).some(
      (key) => !order.products[key].quantity
    );

    if (productWithZeroQuantity) {
      validationErrors.invalidProduct =
        "Product quantity should be greater than 0";
    }

    handleError(validationErrors);

    return {
      isValid: Object.keys(validationErrors).length === 0,
    };
  };

  const onSave = async (e) => {
    if (e) e.preventDefault();

    const { isValid } = validateOrder();
    if (!isValid) return;

    setLoading(true);

    const products = Object.keys(order.products).map((key) => ({
      id: order.products[key].id,
      quantity: Number(order.products[key].quantity),
      measure_unit: order.products[key].unit,
      product_id: order.products[key].type,
    }));

    const payload = {
      delivery_id: order.delivery,
      notes: order.notes,
      customer_name: order.customerName,
    };

    try {
      const url = environment.apiUrl + "/orders";

      const { data } = orderToEdit
        ? await axios.put(`${url}/${orderToEdit.id}`, payload)
        : await axios.post(url, payload);

      await axios.put(
        environment.apiUrl + "/orders/" + data.id + "/items",
        products
      );

      toast.success("Order saved successfully");
      onCreate(selecteDelivery);
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error("Error saving the order");
    }

    setLoading(false);
  };

  const handleError = (errorMsg) => {
    setErrors(errorMsg);

    setTimeout(() => {
      setErrors({});
    }, 3000);
  };

  return (
    <BaseModal onClose={handleClose} size="xlarge" noPadding>
      <div className={mainClass}>
        <form onSubmit={onSave}>
          <TextField
            label="Customer name"
            inputProps={{
              placeholder: "Enter customer name",
              onChange: (e) => onChange(e.target.value, "customerName"),
              value: order.customerName,
            }}
            error={errors.customerName}
          />
          <SelectField
            label={"Delivery"}
            inputProps={{
              placeholder: "Select delivery",
              options: deliveries,
              onChange: (e) => onChange(e.value, "delivery"),
              name: "",
              value: selecteDelivery,
            }}
            error={errors.delivery}
          />

          <div className={mainClass + "__products"}>
            {Object.keys(order.products).length > 0 && (
              <>
                <div className={mainClass + "__products__header"}>
                  <div>Type</div>
                  <div>Quantity</div>
                </div>
                <div className={mainClass + "__products__list"}>
                  {productsToRender.map((product) => (
                    <Product
                      key={product.id}
                      product={product}
                      options={productTypes}
                      onDelete={onRemoveProduct}
                      onChange={(values) => onChangeProduct(product.id, values)}
                    />
                  ))}
                  {errors.invalidProduct && (
                    <div className={mainClass + "__error"}>
                      {errors.invalidProduct}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className={mainClass + "__products__add"}>
              <Button
                iconBefore={Plus}
                variant="accent"
                disabled={loading}
                onClick={onAddNewProdcut}
              >
                Add product
              </Button>
            </div>
          </div>

          <TextAreaField
            label={"Notes"}
            inputProps={{
              placeholder: "Add notes...",
              onChange: (e) => onChange(e.target.value, "notes"),
              value: order.notes,
            }}
          />
        </form>

        {errors.empty && (
          <div className={mainClass + "__error"}>{errors.empty}</div>
        )}

        <div className={mainClass + "__actions"}>
          <Button disabled={loading} variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          {showSaveButton && (
            <Button
              disabled={loading}
              onClick={onSave}
              iconBefore={Save}
              variant="accent"
            >
              Save
            </Button>
          )}
        </div>
      </div>
    </BaseModal>
  );
};

export default NewOrder;
