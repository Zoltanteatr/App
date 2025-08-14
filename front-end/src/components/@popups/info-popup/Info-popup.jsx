import Popup from "../Popup";
import closePopup from "../../../store/slices/popupSlice";
import { useDispatch, useSelector } from "react-redux";
import clsx from "clsx";

import styles from "./info-popup.module.scss";

const InfoPopup = () => {
  const dispatch = useDispatch();
  const { isOpen, popupType } = useSelector((state) => state.popup.generalInfo);

  return (
    <Popup>
      <div
        className={clsx(
          styles.popup,
          isOpen && popupType === "sub" && styles.open
        )}
      >
        <p className={styles.popup__title}>Подписка</p>
        <p className={styles.popup__description}>
          Чтобы купить подписку, сверините приложение и напишите команду /sub
        </p>
        <button
          onClick={() => dispatch(closePopup())}
          className={styles.close__btn}
        >
          Хорошо
        </button>
      </div>
    </Popup>
  );
};
export default InfoPopup;
