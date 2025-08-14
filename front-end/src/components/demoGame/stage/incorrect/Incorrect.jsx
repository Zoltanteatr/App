import gif from "../../../../img/incorrect.gif";
import styles from "./incorrect.module.scss";

const Incorrect = ({ video, setCorrect, isFinalStage, onComplete }) => {
  if (isFinalStage) {
    return (
      <div className={styles.final}>
        <h2 className={styles.final__title}>Спасибо за игру!</h2>
        <p className={styles.final__message}>
          Вы успешно прошли все этапы демо-версии.
        </p>
        <button className={styles.final__button} onClick={onComplete}>
          Закрыть демо-игру
        </button>
      </div>
    );
  }

  return (
    <div className={styles.incorrect}>
      {video === "" ? (
        <div
          style={{
            marginTop: 20,
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <img src={gif} alt="incorrect" width={300} height={300} />
        </div>
      ) : (
        <div className={styles.video__container}>
          <video
            className={styles.game__video}
            preload="auto"
            playsInline
            autoPlay
            loop
            style={{
              width: "100%",
              height: "250px",
              backgroundColor: "#000",
            }}
          >
            <source src={video} type="video/mp4" />
          </video>
        </div>
      )}

      <p className={styles.incorrect__title}>Ответ неверный!</p>
      <button onClick={() => setCorrect(true)} style={{ color: "#000" }}>
        Попробовать ещё
      </button>
    </div>
  );
};
export default Incorrect;
