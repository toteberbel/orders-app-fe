import { useMemo, useState } from "react";
import "./index.scss";
import { Edit3, MoreHorizontal, Trash2 } from "react-feather";
import { Popover } from "react-tiny-popover";
import BasicMenuList from "../BasicMenuList";

const mainClass = "order";

const Order = ({ order, handleEditOrder, onDelete, loading }) => {
  const [showMenu, setShowMenu] = useState(false);

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
        label: "Eliminar",
        icon: Trash2,
        onClick: () => {
          setShowMenu(false);
          onDelete(order.id);
        },
        variant: "distructive",
      },
    ],

    [order]
  );

  return (
    <div className={mainClass + " animate__animated animate__fadeIn"}>
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
