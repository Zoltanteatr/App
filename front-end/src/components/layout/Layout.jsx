import Header from "../header/Header";
import Navigation from "../navigation/Navigation";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import TipPopup from "../@popups/tip-popup/Tip-popup";

import styles from "./layout.module.scss";
import RulesPopup from "../@popups/rules-popup/Rules-popup";
import InfoPopup from "../@popups/info-popup/Info-popup";

const Layout = () => {
  const locate = useLocation();
  const { isOpen, popupType } = useSelector((state) => state.popup.generalInfo);

  return (
    <div className={styles.layout}>
      {locate.pathname !== "/profile" && locate.pathname !== "/intro" ? (
        <Header />
      ) : (
        <></>
      )}
      <Outlet />
      <div className={styles.nav__wrap}>
        {locate.pathname !== "/intro" ? <Navigation /> : ""}
      </div>
      {isOpen && popupType === "tip" && <TipPopup />}
      {isOpen && popupType === "rules" && !localStorage.getItem("before") && (
        <RulesPopup />
      )}
      {isOpen && popupType === "sub" && <InfoPopup />}
    </div>
  );
};
export default Layout;
