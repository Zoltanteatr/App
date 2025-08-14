import clsx from "clsx";

import styles from "./popup.module.scss";

const Popup = ({ type, children }) => {
  return (
    <div className={clsx(styles.popup__wrap, styles[type])}>{children}</div>
  );
};

export default Popup;
