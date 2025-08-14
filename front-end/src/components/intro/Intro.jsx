import intro from "../../videos/intro.mp4";
import Button from "../@ui/Button/Button";
import fcore from "../../img/fcore.png";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { openPopup } from "../../store/slices/popupSlice";

import styles from "./intro.module.scss";

const Intro = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const openPopupData = (type) => {
    dispatch(openPopup({ type: type }));
  };
  return (
    <div className={styles.main}>
      <div className={styles.video__background}>
        <video
          autoPlay
          loop
          muted
          playsInline
          webkit-playsinline="true"
          x5-playsinline="true"
        >
          <source src={intro} type="video/mp4" />
          Ваш браузер не поддерживает видео.
        </video>
      </div>
      <div className={styles.intro__page}>
        <div>
          <p className={styles.main__title}>Игра Золтана</p>
          <p className={styles.main__description}>
            Иммерсивный цифровой детектив
          </p>
        </div>
        <div className={styles.preview__wrap}>
          <Button
            buttonClass="buy__btn__s"
            buttonContent="Начать"
            onClick={() => {
              navigate("/main");
              openPopupData("rules");
            }}
          />
        </div>
        <div className={styles.team__info}>
          <p className={styles.team__name}>Powered by</p>
          <img src={fcore} alt="" className={styles.team__logo} />
        </div>
      </div>
    </div>
  );
};
export default Intro;
