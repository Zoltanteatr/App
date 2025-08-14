import { Link } from "react-router-dom";
import clsx from "clsx";

import styles from "./link-nav.module.scss";

const LinkNav = ({ routeLink, routeIco, isActive, onClick }) => {
  return (
    <Link
      to={routeLink}
      className={clsx(styles.link, isActive ? styles.active : "")}
      onClick={onClick}
    >
      <img
        src={routeIco}
        alt="route"
        className={clsx(styles.route__image, isActive ? styles.active : "")}
      />
    </Link>
  );
};
export default LinkNav;
