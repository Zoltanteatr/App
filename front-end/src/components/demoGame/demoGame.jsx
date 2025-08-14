import blur from "../../img/blur__one.svg";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

import styles from "./demoGame.module.scss";
import Stage from "./stage/Stage";

const DemoGame = () => {
  const { stages, name } = useSelector((state) => state.demo.games[0]);
  const [currentStage, setStage] = useState(1);
  const stage = stages.find((item) => item.id === currentStage);
  const [stageData, setData] = useState({
    description: stage.description,
    video: stage.video,
    incorrect: stage.incorrect,
    tips: stage.tips,
    answer: stage.answer,
    format: stage.format,
  });
  useEffect(() => {
    const newStage = stages.find((item) => item.id === currentStage);
    if (newStage) {
      setData({
        description: newStage.description,
        video: newStage.video,
        incorrect: newStage.incorrect,
        tips: newStage.tips,
        answer: newStage.answer,
        format: newStage.format,
      });
    }
  }, [currentStage, stages]);

  return (
    <div className={styles.demo__game}>
      <img src={blur} alt="" className={styles.blur__image} />
      <img src={blur} alt="" className={styles.blur__image__sec} />
      <p className={styles.game__title}>{name}</p>
      {stage && (
        <Stage
          description={stageData.description}
          video={stageData.video}
          tips={stageData.tips}
          answer={stageData.answer}
          incorrect={stageData.incorrect}
          format={stageData.format}
          setStage={setStage}
          currentStage={currentStage}
        />
      )}
    </div>
  );
};

export default DemoGame;
