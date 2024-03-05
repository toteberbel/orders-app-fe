import "./index.scss";

const BasicMenuList = ({ menus = [], legend, className = "" }) => {
  return (
    <div
      className={`dg-basic-menu-list animate__animated animate__fadeIn animate__faster ${className}`}
    >
      {legend && <small> {legend} </small>}
      {menus.map((menu) => (
        <div
          key={menu.label}
          className={`dg-basic-menu-list__item dg-basic-menu-list__item-${menu.variant}`}
          onClick={(e) => {
            menu.onClick();
            e.stopPropagation();
          }}
        >
          {menu.icon && <menu.icon />}
          {menu.label}
          {menu.iconAfter && <menu.iconAfter />}
        </div>
      ))}
    </div>
  );
};

export default BasicMenuList;
