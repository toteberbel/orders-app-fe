import { useEffect, useMemo, useState } from "react";
import TabBar from "../../components/TabBar";
import "./index.scss";
import NewOrder, { DELIVERY_DAYS } from "../../components/NewOrder";
import axios from "axios";
import { environment } from "../../../config/env";
import Order from "../../components/Order";
import toast from "react-hot-toast";
import Spinner from "../../components/Spinner";
import { FileText, BarChart2, DollarSign } from "react-feather";
import { useNavigate } from "react-router-dom";
import "animate.css";
import TextField from "../../components/TextField";
import SelectField from "../../components/SelectField";
import Totals from "../../components/Totals";
import Button from "../../components/Button";
import ProfitPasswordModal from "../../components/ProfitPasswordModal";

const mainClass = "home";

const DAYS_OPTIONS = [
  {
    label: "Todos los días",
    full: "Todos los días",
    value: "all",
  },
  ...DELIVERY_DAYS,
];

// remove accents from the full name of the day
const today = new Date()
  .toLocaleDateString(undefined, { weekday: "long" })
  .normalize("NFD") // Normalize to decomposed form
  .replace(/[\u0300-\u036f]/g, "");

const todayOption =
  DAYS_OPTIONS.find((day) => day.full === today) || DAYS_OPTIONS[0];

const Home = () => {
  const navigate = useNavigate();
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [orderToEdit, setOrderToEdit] = useState(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  const [daysFilter, setDaysFilter] = useState(todayOption);
  const [showTotals, setShowTotals] = useState(false);
  const [showProfitPassword, setShowProfitPassword] = useState(false);

  useEffect(() => {
    getDeliveries();
    getOrders();
  }, []);

  const getOrders = async () => {
    try {
      const response = await axios.get(environment.apiUrl + "/orders");

      setOrders(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getDeliveries = async () => {
    try {
      const response = await axios.get(environment.apiUrl + "/delivery");

      const options = response.data.map((delivery) => ({
        label: delivery.name,
        value: delivery.id,
      }));
      setDeliveries(options);
      setSelectedDelivery(options[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const onDeleteOrder = async (orderId) => {
    setLoading(true);
    try {
      await axios.delete(environment.apiUrl + `/orders/${orderId}`);
      getOrders();
      toast.success("Order deleted successfully");
    } catch (error) {
      toast.error("Error deleting order");
    }
    setLoading(false);
  };

  const onToggleActive = async (orderId, active) => {
    setLoading(true);
    try {
      await axios.put(environment.apiUrl + `/orders/${orderId}/active`, {
        active,
      });
      getOrders();
      toast.success("Orden actualizada");
    } catch (error) {
      toast.error("Error actualizando la orden");
    }
    setLoading(false);
  };

  const handleOrderToEdit = (order) => {
    const items = {};
    order.order_items.forEach((item) => {
      items[item.id] = {
        id: item.id,
        type: item.product.id,
        unit: item.measure_unit,
        quantity: item.quantity,
      };
    });

    const payload = {
      id: order.id,
      customerName: order.customer_name,
      delivery: order.delivery.id,
      notes: order.notes,
      products: items,
      deliveryDays: order.days_to_be_delivered,
    };
    setOrderToEdit(payload);
  };

  const filteredOrders = useMemo(() => {
    if (!deliveries.length || !orders.length) return [];
    const days =
      daysFilter.value === "all"
        ? DELIVERY_DAYS.map((day) => day.value)
        : [daysFilter?.value];

    return orders.filter(
      (order) =>
        order.delivery.id === selectedDelivery.value &&
        order.customer_name.toLowerCase().includes(search.toLowerCase()) &&
        order.days_to_be_delivered.some((d) => days.includes(d))
    );
  }, [search, orders, deliveries, selectedDelivery, daysFilter]);

  return (
    <div className={mainClass}>
      {showTotals && (
        <Totals orders={orders} handleClose={() => setShowTotals(false)} />
      )}
      {showProfitPassword && (
        <ProfitPasswordModal
          handleClose={() => setShowProfitPassword(false)}
          onSuccess={() => {
            setShowProfitPassword(false);
            navigate("/ganancias");
          }}
        />
      )}
      {(showNewOrderModal || orderToEdit) && (
        <NewOrder
          deliveries={deliveries}
          orderToEdit={orderToEdit}
          handleClose={() => {
            setShowNewOrderModal(false);
            setOrderToEdit(null);
          }}
          onCreate={(delivery) => {
            getOrders();
            !orderToEdit && setSelectedDelivery(delivery);
          }}
        />
      )}
      <div className={mainClass + "__content"}>
        {loading && (
          <div>
            <Spinner />
          </div>
        )}

        {!loading && !filteredOrders.length ? (
          <div
            className={mainClass + "__empty animate__animated animate__fadeIn"}
          >
            <FileText />
            <span> No hay ordenes creadas aún.</span>
          </div>
        ) : null}

        {!loading && orders.length ? (
          <div className={mainClass + "__search"}>
            <TextField
              label="Buscar por cliente"
              inputProps={{
                value: search,
                onChange: (e) => setSearch(e.target.value),
              }}
            />

            <div className={mainClass + "__days"}>
              <SelectField
                label={"Filtrar por día de entrega"}
                inputProps={{
                  options: DAYS_OPTIONS,
                  onChange: (e) => setDaysFilter(e),
                  name: "",
                  value: daysFilter,
                }}
              />
            </div>

            <div className={mainClass + "__totals-action"}>
              <Button
                variant="secondary"
                iconBefore={DollarSign}
                onClick={() => setShowProfitPassword(true)}
              >
                Ganancias
              </Button>
              <Button
                variant="secondary"
                iconBefore={BarChart2}
                onClick={() => setShowTotals(true)}
              >
                Ver totales
              </Button>
            </div>
          </div>
        ) : null}

        {filteredOrders.map((order) => (
          <Order
            order={order}
            key={order.id}
            onDelete={onDeleteOrder}
            onToggleActive={onToggleActive}
            handleEditOrder={handleOrderToEdit}
            loading={loading}
          />
        ))}
      </div>
      <div className={mainClass + "__current-day"}>
        <p>
          Pedidos para {daysFilter?.value === "all" ? "" : "el día"}{" "}
          <span> {daysFilter?.full} </span>
        </p>
      </div>

      <TabBar
        selectedTab={selectedDelivery}
        handleSelectedTab={setSelectedDelivery}
        handleNewOrderModal={() => setShowNewOrderModal(true)}
        deliveries={deliveries}
      />
    </div>
  );
};

export default Home;
