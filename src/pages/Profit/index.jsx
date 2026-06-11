import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { PROFIT_AUTH_KEY } from "../../components/ProfitPasswordModal";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, Check, Edit2, Plus, Trash2, X } from "react-feather";
import { environment } from "../../../config/env";
import { DELIVERY_DAYS } from "../../components/NewOrder";
import TextField from "../../components/TextField";
import SelectField from "../../components/SelectField";
import Button from "../../components/Button";
import Spinner from "../../components/Spinner";
import "./index.scss";

const mainClass = "profit";

// remove accents from the full name of the day
const today = new Date()
  .toLocaleDateString(undefined, { weekday: "long" })
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "");

const todayOption =
  DELIVERY_DAYS.find((day) => day.full === today) || DELIVERY_DAYS[0];

const AVERAGE_DAYS_PER_MONTH = 30;

const COST_PERIODS = [
  { label: "Por día", value: "diario" },
  { label: "Por mes", value: "mensual" },
];

// daily equivalent of a cost: monthly amounts are split across the month
const dailyCostAmount = (cost) => {
  const amount = Number(cost.amount) || 0;
  return cost.period === "mensual" ? amount / AVERAGE_DAYS_PER_MONTH : amount;
};

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

const formatQuantity = (value, unit) => {
  if (unit === "kg") {
    return Number.isInteger(value) ? `${value} kg` : `${value.toFixed(2)} kg`;
  }
  return `${value} ${unit}`;
};

const Profit = () => {
  const navigate = useNavigate();

  if (sessionStorage.getItem(PROFIT_AUTH_KEY) !== "1") {
    return <Navigate to="/" replace />;
  }

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [costs, setCosts] = useState([]);

  const [selectedDay, setSelectedDay] = useState(todayOption);

  // single selling price per kg, shared by every product
  const [savedPrice, setSavedPrice] = useState(0);
  const [price, setPrice] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);

  const [newCost, setNewCost] = useState({
    name: "",
    amount: "",
    period: COST_PERIODS[0],
  });
  const [addingCost, setAddingCost] = useState(false);

  const [editingCostId, setEditingCostId] = useState(null);
  const [editingDraft, setEditingDraft] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([getOrders(), getPrice(), getCosts()]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const getOrders = async () => {
    try {
      const response = await axios.get(environment.apiUrl + "/orders");
      setOrders(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Error cargando los pedidos");
    }
  };

  const getPrice = async () => {
    try {
      const response = await axios.get(environment.apiUrl + "/products");
      // every product shares the same price; take the highest just in case
      const currentPrice = Math.max(
        0,
        ...response.data.map((product) => Number(product.price) || 0),
      );
      setSavedPrice(currentPrice);
      setPrice(currentPrice ? String(currentPrice) : "");
    } catch (error) {
      console.error(error);
      toast.error("Error cargando el precio");
    }
  };

  const getCosts = async () => {
    try {
      const response = await axios.get(environment.apiUrl + "/costs");
      setCosts(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Error cargando los costos");
    }
  };

  // kg of bread sold on the selected day across active orders for that day.
  // every weight-based product is collapsed into a single "Pan" line because
  // they're all variants of the same bread sold at the same price per kg.
  const dailySales = useMemo(() => {
    const dayOrders = orders.filter(
      (order) =>
        order.active !== false &&
        order.days_to_be_delivered?.includes(selectedDay.value),
    );

    let totalKg = 0;

    dayOrders.forEach((order) => {
      order.order_items?.forEach((item) => {
        if (!item.product) return;

        let quantity = Number(item.quantity) || 0;
        if (item.measure_unit === "gr") {
          quantity = quantity / 1000;
        } else if (item.measure_unit !== "kg") {
          return;
        }

        totalKg += quantity;
      });
    });

    if (totalKg <= 0) return [];

    return [{ name: "Pan", unit: "kg", quantity: totalKg }];
  }, [orders, selectedDay]);

  const currentPrice = Number(price) || 0;

  const salesRows = useMemo(
    () =>
      dailySales.map((row) => ({
        ...row,
        subtotal: row.quantity * currentPrice,
      })),
    [dailySales, currentPrice],
  );

  const totalRevenue = salesRows.reduce((acc, row) => acc + row.subtotal, 0);
  const totalCosts = costs.reduce(
    (acc, cost) => acc + dailyCostAmount(cost),
    0,
  );
  const totalProfit = totalRevenue - totalCosts;

  const onSavePrice = async () => {
    setSavingPrice(true);
    try {
      await axios.patch(environment.apiUrl + "/products/price", {
        price: currentPrice,
      });
      setSavedPrice(currentPrice);
      toast.success("Precio guardado");
    } catch (error) {
      console.error(error);
      toast.error("Error guardando el precio");
    }
    setSavingPrice(false);
  };

  const onAddCost = async () => {
    const amount = Number(newCost.amount);
    if (
      !newCost.name.trim() ||
      !newCost.amount ||
      isNaN(amount) ||
      amount < 0
    ) {
      toast.error("Ingresá un nombre y un monto válido");
      return;
    }

    setAddingCost(true);
    try {
      await axios.post(environment.apiUrl + "/costs", {
        name: newCost.name.trim(),
        amount,
        period: newCost.period.value,
      });
      setNewCost({ name: "", amount: "", period: COST_PERIODS[0] });
      await getCosts();
    } catch (error) {
      console.error(error);
      toast.error("Error agregando el costo");
    }
    setAddingCost(false);
  };

  const onDeleteCost = async (costId) => {
    try {
      await axios.delete(environment.apiUrl + `/costs/${costId}`);
      if (editingCostId === costId) {
        setEditingCostId(null);
        setEditingDraft(null);
      }
      await getCosts();
    } catch (error) {
      console.error(error);
      toast.error("Error eliminando el costo");
    }
  };

  const onStartEditCost = (cost) => {
    setEditingCostId(cost.id);
    setEditingDraft({
      name: cost.name,
      amount: String(cost.amount ?? ""),
      period:
        COST_PERIODS.find((p) => p.value === cost.period) || COST_PERIODS[0],
    });
  };

  const onCancelEditCost = () => {
    setEditingCostId(null);
    setEditingDraft(null);
  };

  const onSaveEditCost = async () => {
    if (!editingDraft) return;

    const amount = Number(editingDraft.amount);
    if (
      !editingDraft.name.trim() ||
      editingDraft.amount === "" ||
      isNaN(amount) ||
      amount < 0
    ) {
      toast.error("Ingresá un nombre y un monto válido");
      return;
    }

    setSavingEdit(true);
    try {
      await axios.patch(environment.apiUrl + `/costs/${editingCostId}`, {
        name: editingDraft.name.trim(),
        amount,
        period: editingDraft.period.value,
      });
      setEditingCostId(null);
      setEditingDraft(null);
      await getCosts();
    } catch (error) {
      console.error(error);
      toast.error("Error actualizando el costo");
    }
    setSavingEdit(false);
  };

  return (
    <div className={mainClass}>
      <div className={mainClass + "__header"}>
        <button
          className={mainClass + "__back"}
          onClick={() => navigate("/")}
          aria-label="Volver"
        >
          <ArrowLeft />
        </button>
        <h2>Ganancias del negocio</h2>
      </div>

      {loading ? (
        <div className={mainClass + "__loading"}>
          <Spinner />
        </div>
      ) : (
        <div className={mainClass + "__content"}>
          <SelectField
            label="Día"
            inputProps={{
              options: DELIVERY_DAYS,
              onChange: (e) => setSelectedDay(e),
              name: "day",
              value: selectedDay,
            }}
          />

          <div className={mainClass + "__summary"}>
            <div className={mainClass + "__summary-card"}>
              <span>Ingresos del día</span>
              <strong>{formatMoney(totalRevenue)}</strong>
            </div>
            <div className={mainClass + "__summary-card"}>
              <span>Costos del día</span>
              <strong>{formatMoney(totalCosts)}</strong>
            </div>
            <div
              className={
                mainClass +
                "__summary-card " +
                mainClass +
                (totalProfit >= 0
                  ? "__summary-card--positive"
                  : "__summary-card--negative")
              }
            >
              <span>Ganancia del día</span>
              <strong>{formatMoney(totalProfit)}</strong>
            </div>
          </div>

          <section className={mainClass + "__section"}>
            <h3>Precio del pan</h3>
            <p className={mainClass + "__hint"}>
              Un solo precio por kg para todas las variedades. Los productos que
              se venden por unidad no se incluyen en el cálculo.
            </p>

            <div className={mainClass + "__price"}>
              <TextField
                label="Precio por kg"
                inputProps={{
                  type: "number",
                  min: 0,
                  step: "0.01",
                  placeholder: "0",
                  value: price,
                  onChange: (e) => setPrice(e.target.value),
                }}
              />
              <Button
                onClick={onSavePrice}
                loading={savingPrice}
                disabled={savingPrice || currentPrice === savedPrice}
              >
                Guardar
              </Button>
            </div>
          </section>

          <section className={mainClass + "__section"}>
            <h3>Ventas del día ({selectedDay.full})</h3>
            <p className={mainClass + "__hint"}>
              Calculado con los pedidos activos que se entregan ese día.
            </p>

            {currentPrice === 0 && salesRows.length > 0 && (
              <div className={mainClass + "__warning"}>
                Configurá el precio por kg para calcular los ingresos.
              </div>
            )}

            {salesRows.length === 0 ? (
              <div className={mainClass + "__empty"}>
                No hay pedidos activos para ese día.
              </div>
            ) : (
              <table className={mainClass + "__table"}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {salesRows.map((row) => (
                    <tr key={row.name}>
                      <td>{row.name}</td>
                      <td>{formatQuantity(row.quantity, row.unit)}</td>
                      <td>{formatMoney(row.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2}>Total</td>
                    <td>{formatMoney(totalRevenue)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </section>

          <section className={mainClass + "__section"}>
            <h3>Costos del negocio</h3>
            <p className={mainClass + "__hint"}>
              Ingresá los costos del negocio (harina, sueldos, luz, etc.). Los
              costos mensuales se dividen por {AVERAGE_DAYS_PER_MONTH} para
              calcular el costo por día.
            </p>

            <div className={mainClass + "__new-cost"}>
              <TextField
                label="Nombre"
                inputProps={{
                  value: newCost.name,
                  placeholder: "Ej: Harina",
                  onChange: (e) =>
                    setNewCost((prev) => ({ ...prev, name: e.target.value })),
                }}
              />
              <TextField
                label="Monto"
                inputProps={{
                  type: "number",
                  min: 0,
                  step: "0.01",
                  placeholder: "0",
                  value: newCost.amount,
                  onChange: (e) =>
                    setNewCost((prev) => ({ ...prev, amount: e.target.value })),
                }}
              />
              <SelectField
                label="Frecuencia"
                inputProps={{
                  options: COST_PERIODS,
                  onChange: (e) =>
                    setNewCost((prev) => ({ ...prev, period: e })),
                  name: "period",
                  value: newCost.period,
                }}
              />
              <Button
                iconBefore={Plus}
                onClick={onAddCost}
                loading={addingCost}
                disabled={addingCost}
              >
                Agregar
              </Button>
            </div>

            {costs.length === 0 ? (
              <div className={mainClass + "__empty"}>
                Todavía no agregaste costos.
              </div>
            ) : (
              <table
                className={mainClass + "__table " + mainClass + "__costs-table"}
              >
                <thead>
                  <tr>
                    <th>Costo</th>
                    <th>Monto</th>
                    <th>Por día</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {costs.map((cost) => {
                    const isEditing = editingCostId === cost.id;

                    if (isEditing) {
                      return (
                        <tr key={cost.id}>
                          <td>
                            <input
                              className={mainClass + "__edit-input"}
                              value={editingDraft.name}
                              onChange={(e) =>
                                setEditingDraft((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                            />
                          </td>
                          <td>
                            <input
                              className={
                                mainClass +
                                "__edit-input " +
                                mainClass +
                                "__edit-input--amount"
                              }
                              type="number"
                              min={0}
                              step="0.01"
                              value={editingDraft.amount}
                              onChange={(e) =>
                                setEditingDraft((prev) => ({
                                  ...prev,
                                  amount: e.target.value,
                                }))
                              }
                            />
                          </td>
                          <td>
                            {formatMoney(
                              dailyCostAmount({
                                amount: Number(editingDraft.amount) || 0,
                                period: editingDraft.period.value,
                              }),
                            )}
                          </td>
                          <td>
                            <div className={mainClass + "__row-actions"}>
                              <button
                                className={mainClass + "__icon-action"}
                                onClick={onSaveEditCost}
                                disabled={savingEdit}
                                aria-label="Guardar cambios"
                              >
                                <Check />
                              </button>
                              <button
                                className={mainClass + "__icon-action"}
                                onClick={onCancelEditCost}
                                disabled={savingEdit}
                                aria-label="Cancelar"
                              >
                                <X />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={cost.id}>
                        <td>{cost.name}</td>
                        <td>
                          {cost.period === "mensual" && (
                            <>
                              {formatMoney(cost.amount)}
                              <div className={mainClass + "__period"}>
                                Mensual
                              </div>
                            </>
                          )}
                        </td>
                        <td>{formatMoney(dailyCostAmount(cost))}</td>
                        <td>
                          <div className={mainClass + "__row-actions"}>
                            <button
                              className={mainClass + "__icon-action"}
                              onClick={() => onStartEditCost(cost)}
                              aria-label={`Editar ${cost.name}`}
                            >
                              <Edit2 />
                            </button>
                            <button
                              className={
                                mainClass +
                                "__icon-action " +
                                mainClass +
                                "__icon-action--danger"
                              }
                              onClick={() => onDeleteCost(cost.id)}
                              aria-label={`Eliminar ${cost.name}`}
                            >
                              <Trash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2}>Total por día</td>
                    <td>{formatMoney(totalCosts)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Profit;
