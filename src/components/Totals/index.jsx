import { useMemo } from "react";
import BaseModal from "../BaseModal";
import "./index.scss";

const mainClass = "totals";

const Totals = ({ orders, handleClose }) => {
  const rows = useMemo(() => {
    // key: `${productName}__${unit}` where unit is "kg" or "unidad"
    const totals = {};

    const activeOrders = orders.filter((order) => order.active !== false);

    activeOrders.forEach((order) => {
      order.order_items?.forEach((item) => {
        const name = item.product?.type || "—";
        const rawUnit = item.measure_unit;

        let unit;
        let quantity = Number(item.quantity) || 0;

        if (rawUnit === "kg") {
          unit = "kg";
        } else if (rawUnit === "gr") {
          unit = "kg";
          quantity = quantity / 1000;
        } else {
          unit = rawUnit || "unidad";
        }

        const key = `${name}__${unit}`;
        if (!totals[key]) {
          totals[key] = { name, unit, quantity: 0 };
        }
        totals[key].quantity += quantity;
      });
    });

    return Object.values(totals)
      .filter((row) => row.quantity > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [orders]);

  const formatQuantity = (value, unit) => {
    if (unit === "kg") {
      return Number.isInteger(value) ? `${value} kg` : `${value.toFixed(2)} kg`;
    }
    return `${value} ${unit}`;
  };

  return (
    <BaseModal handleClose={handleClose} size="medium" showCloseIcon>
      <div className={mainClass}>
        <h3 className={mainClass + "__title"}>Totales de productos</h3>

        {rows.length === 0 ? (
          <div className={mainClass + "__empty"}>
            No hay productos para sumar.
          </div>
        ) : (
          <table className={mainClass + "__table"}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.name}-${row.unit}`}>
                  <td>{row.name}</td>
                  <td>{formatQuantity(row.quantity, row.unit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </BaseModal>
  );
};

export default Totals;
