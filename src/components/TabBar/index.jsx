import { Plus } from "react-feather";
import "./index.scss";

const mainClass = "tab-bar";

const TabBar = ({
  selectedTab,
  handleSelectedTab,
  deliveries,
  handleNewOrderModal,
}) => {
  return (
    <div className={mainClass}>
      <div className={mainClass + "__list"}>
        {deliveries.map((delivery) => (
          <div
            key={delivery.value}
            onClick={() => handleSelectedTab(delivery)}
            className={`${mainClass + "__tab"} ${
              selectedTab?.value === delivery.value
                ? mainClass + "__tab-active"
                : ""
            } `}
          >
            {delivery.label}
          </div>
        ))}
      </div>
      <div onClick={handleNewOrderModal} className={mainClass + "__add"}>
        <Plus />
      </div>
    </div>
  );
};

export default TabBar;
