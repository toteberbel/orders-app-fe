import { useEffect, useMemo, useState } from "react";
import TabBar from "../../components/TabBar";
import "./index.scss";
import NewOrder from "../../components/NewOrder";
import axios from "axios";
import { environment } from "../../../config/env";
import Order from "../../components/Order";
import toast from "react-hot-toast";
import Spinner from "../../components/Spinner";
import { FileText } from "react-feather";
import "animate.css";
import TextField from "../../components/TextField";

const mainClass = "home";

const Home = () => {
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [orderToEdit, setOrderToEdit] = useState(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

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
    };
    console.log(payload);
    setOrderToEdit(payload);
  };

  const filteredOrders = useMemo(() => {
    if (!deliveries.length || !orders.length) return [];
    return orders.filter(
      (order) =>
        order.delivery.id === selectedDelivery.value &&
        order.customer_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, orders, deliveries, selectedDelivery]);

  return (
    <div className={mainClass}>
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
          </div>
        ) : null}

        {filteredOrders.map((order) => (
          <Order
            order={order}
            key={order.id}
            onDelete={onDeleteOrder}
            handleEditOrder={handleOrderToEdit}
            loading={loading}
          />
        ))}
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
