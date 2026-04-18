import { useCallback, useMemo, useState } from "react";
import "./index.scss";
import {
  Edit3,
  MoreHorizontal,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
} from "react-feather";
import { Popover } from "react-tiny-popover";
import BasicMenuList from "../BasicMenuList";
import Button from "../Button";
import { DELIVERY_DAYS } from "../NewOrder";

const mainClass = "order";

const Order = ({ order, handleEditOrder, onDelete, onToggleActive, loading }) => {
  const [showMenu, setShowMenu] = useState(false);

  const isActive = order.active !== false;

  const MENUS = useMemo(
    () => [
      {
        label: "Editar",
        icon: Edit3,
        onClick: () => {
          setShowMenu(false);
          handleEditOrder(order);
        },
      },
      {
        label: isActive ? "Desactivar" : "Activar",
        icon: isActive ? EyeOff : Eye,
        onClick: () => {
          setShowMenu(false);
          onToggleActive(order.id, !isActive);
        },
      },
      {
        label: "Eliminar",
        icon: Trash2,
        onClick: () => {
          setShowMenu(false);
          onDelete(order.id);
        },
        variant: "distructive",
      },
    ],

    [order, isActive]
  );

  const getDay = useCallback((day) => {
    const fullDay = DELIVERY_DAYS.find((d) => d.value === day);
    return fullDay.label;
  }, []);

  const getOrderDaysOrdered = useCallback(() => {
    const indexes = DELIVERY_DAYS.filter(
      (d) =>
        order.days_to_be_delivered.includes(d.full) ||
        order.days_to_be_delivered.includes(d.label) ||
        order.days_to_be_delivered.includes(d.value)
    );

    const ordered = indexes.sort((a, b) => a.index - b.index);

    return ordered.map((d) => d.value);
  }, []);

  return (
    <div
      className={`${mainClass} animate__animated animate__fadeIn ${
        !isActive ? mainClass + "--inactive" : ""
      }`}
    >
      {!isActive && (
        <div className={mainClass + "__inactive-banner"}>
          <AlertTriangle />
          <span>No preparar</span>
        </div>
      )}
      <div
        className={`${mainClass}__header ${
          loading ? mainClass + "__loading" : ""
        }`}
      >
        <span> {order.customer_name} </span>

        {!loading && (
          <Popover
            isOpen={showMenu}
            positions={["bottom", "left", "right"]}
            align="end"
            content={<BasicMenuList menus={MENUS} />}
            onClickOutside={() => setShowMenu(false)}
          >
            <MoreHorizontal
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="cg-report-item__menu-icon"
            />
          </Popover>
        )}
      </div>
      <div className={`${mainClass}__content`}>
        {order.order_items?.length > 0 && (
          <div className={mainClass + "__products"}>
            <div className={`${mainClass}__products__header `}>
              <div>Cantidad</div>
              <div>Tipo</div>
            </div>
            {order.order_items.map((product) => (
              <div key={product.id}>
                <div>
                  {product.quantity} {product.measure_unit}
                </div>
                <div> {product.product.type} </div>
              </div>
            ))}
          </div>
        )}

        <div className={mainClass + "__days"}>
          <label>Dias de entrega</label>
          <div>
            {getOrderDaysOrdered().map((day) => (
              <Button onClick={() => {}} key={day} variant={"accent"}>
                {getDay(day)}
              </Button>
            ))}
          </div>
        </div>

        {order.notes && (
          <div className={mainClass + "__notes"}>
            <span>Notas:</span>
            <p>{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;
