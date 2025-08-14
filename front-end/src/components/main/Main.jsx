import intro from "../../videos/intro.mp4";
import { useState } from "react";
import Games from "./games/Games";
import clsx from "clsx";
import styles from "./main.module.scss";

const Main = () => {
  const [currentController, setController] = useState("prev");

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
          x5-video-player-type="h5"
          x5-video-player-fullscreen="false"
          x5-video-orientation="portraint"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: -1,
          }}
        >
          <source src={intro} type="video/mp4" />
          Ваш браузер не поддерживает видео.
        </video>
      </div>
      <section className={styles.main__page}>
        <div>
          <p className={styles.main__title}>Игра Золтана</p>
          <p className={styles.main__description}>
            Иммерсивный цифровой детектив
          </p>
        </div>

        <div className={styles.main__games}>
          <div className={styles.games__controller}>
            <div
              className={clsx(
                styles.controller,
                currentController === "prev" ? styles.active : ""
              )}
              onClick={() => setController("prev")}
            >
              Предстоящие игры
            </div>
            <div
              className={clsx(
                styles.controller,
                currentController === "upcome" ? styles.active : ""
              )}
              onClick={() => setController("upcome")}
            >
              Прошедшие игры
            </div>
          </div>
          <div className={styles.games}>
            <Games category={currentController} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Main;
