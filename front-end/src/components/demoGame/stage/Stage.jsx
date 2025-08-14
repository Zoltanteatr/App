import clsx from "clsx";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import Incorrect from "./incorrect/Incorrect";
import { useNavigate } from "react-router-dom";
import { setOpen } from "../../../store/slices/demoSlice";

import styles from "./stage.module.scss";

const Stage = ({
  description,
  video,
  incorrect,
  answer,
  tips,
  format,
  setStage,
  currentStage,
}) => {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [visibleHintIndex, setVisibleHintIndex] = useState(-1);
  const [stageAnswer, setAnswer] = useState("");
  const [isCorrect, setCorrect] = useState(true);

  useEffect(() => {
    setVisibleHintIndex(-1);
    setAnswer("");
    setCorrect(true);
  }, [description, video, answer]);

  const showNextHint = () => {
    if (visibleHintIndex < tips.length - 1) {
      setVisibleHintIndex((prev) => prev + 1);
    } else {
      setVisibleHintIndex(-1);
    }
  };

  const checkAnswer = () => {
    const trimmedAnswer = stageAnswer.replace(/\s/g, ""); // Удаляем пробелы только при проверке
    if (
      answer.toLowerCase() === trimmedAnswer.toLowerCase() &&
      trimmedAnswer !== ""
    ) {
      setStage((prev) => ++prev);
    } else {
      setCorrect(false);
    }
  };

  const endGame = () => {
    dispatch(setOpen(false));
    nav("/");
    setStage(1);
  };

  return (
    <div className={styles.stage}>
      {!isCorrect ? (
        <Incorrect video={incorrect} setCorrect={setCorrect} />
      ) : null}
      <div className={styles.video__container}>
        <video
          className={styles.game__video}
          preload="auto"
          playsInline
          controls
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            backgroundColor: "#000",
          }}
          key={video}
        >
          <source src={video} type="video/mp4" />
        </video>
      </div>
      <p className={styles.game__description}>{description}</p>
      {currentStage === 4 ? (
        <></>
      ) : (
        <>
          {" "}
          <p className={styles.format}>{format}</p>
          <div className={styles.tip__container}>
            <div
              className={clsx(
                styles.hint,
                visibleHintIndex >= 0 && styles.active
              )}
            >
              {visibleHintIndex >= 0 && tips[visibleHintIndex]}
            </div>
            <button onClick={showNextHint} className={styles.hint__toggle}>
              {visibleHintIndex === -1
                ? "Показать подсказку"
                : visibleHintIndex < tips.length - 1
                ? "Показать следующую подсказку"
                : "Скрыть подсказки"}
            </button>
          </div>
        </>
      )}

      <div className={styles.game__controlls}>
        {currentStage === 4 || (
          <input
            type="text"
            placeholder="Введите ответ"
            value={stageAnswer}
            onChange={(e) => setAnswer(e.target.value)}
            className={styles.answer__input}
            onKeyPress={(e) => e.key === "Enter" && checkAnswer()}
          />
        )}

        <button
          className={styles.answer__button}
          onClick={currentStage === 4 ? endGame : checkAnswer}
        >
          {currentStage === 4 ? "Завершить" : "Ответить"}
        </button>
      </div>
    </div>
  );
};
export default Stage;
