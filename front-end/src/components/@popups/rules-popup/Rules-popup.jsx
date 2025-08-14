import Popup from "../Popup";
import clsx from "clsx";
import { useSelector, useDispatch } from "react-redux";
import Agreement from "../../../docs/agreement.txt";
import { closePopup } from "../../../store/slices/popupSlice";
import Button from "../../@ui/Button/Button";
import { Link } from "react-router-dom";
import { useState } from "react";

import styles from "./rules-popup.module.scss";

const RulesPopup = () => {
  const dispatch = useDispatch();
  const { isOpen, popupType } = useSelector((state) => state.popup.generalInfo);
  const [checked, setChecked] = useState(false);
  const [stage, setStage] = useState(1);

  const handleCheckBox = () => {
    setChecked((prev) => !prev);
  };

  const handleClose = () => {
    dispatch(closePopup());
    localStorage.setItem("before", true);
  };

  return (
    <Popup>
      <div
        className={clsx(
          styles.popup,
          isOpen &&
            popupType === "rules" &&
            !localStorage.getItem("before") &&
            styles.open
        )}
      >
        <p className={styles.popup__name}>Добро пожаловать</p>

        <p className={styles.popup__description}>
          {stage === 1
            ? "Чтобы начать проходить игры, вам необходимо согласиться с правилами."
            : "Рекомендуем пройти пробную игру в разделе «?»"}
        </p>

        {stage === 1 && (
          <>
            <a download={true} href={Agreement}>
              Скачать правила
            </a>
            <div className={styles.check__wrap}>
              <div
                className={styles.check__box}
                onClick={handleCheckBox}
                role="checkbox"
                aria-checked={checked}
              >
                {checked && <div className={styles.checked} />}
              </div>
              <p>Я согласен с правилами</p>
            </div>
          </>
        )}

        {stage === 2 && (
          <Link className={styles.buy__btn} to="/info" onClick={handleClose}>
            Пройти
          </Link>
        )}

        <Button
          buttonContent={stage === 1 ? "Продолжить" : "Позже"}
          secondClass="buy__btn"
          onClick={() => {
            if (stage === 1) {
              if (checked) setStage(2);
            } else {
              handleClose();
            }
          }}
          disabled={stage === 1 && !checked}
        />
      </div>
    </Popup>
  );
};

export default RulesPopup;
