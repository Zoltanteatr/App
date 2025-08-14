import clsx from "clsx";
import { closePopup } from "../../../store/slices/popupSlice";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../@ui/Button/Button";

import styles from "./tip-popup.module.scss";
import Popup from "../Popup";

const TipPopup = () => {
  const dispatch = useDispatch();
  const { isOpen, popupType } = useSelector((state) => state.popup.generalInfo);
  const { popupName, popupDescription } = useSelector(
    (state) => state.popup.popupInfo
  );

  return (
    <Popup type="tip">
      <div
        className={clsx(
          styles.popup,
          isOpen && popupType === "tip" && styles.open
        )}
      >
        <div>
          <p className={styles.popup__title}>{popupName}</p>
          <p className={styles.popup__description}>{popupDescription}</p>
        </div>

        <Button
          buttonContent="Я понял"
          onClick={() => dispatch(closePopup())}
          buttonClass="close__btn"
        />
      </div>
    </Popup>
  );
};
export default TipPopup;
