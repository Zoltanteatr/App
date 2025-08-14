import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import blur from "../../img/blur__one.svg";
import correct from "../../img/Correct.svg";
import incorrect from "../../img/incorrect.gif";
import styles from "./game.module.scss";
import Controlls from "./controlls/Controlls";
import { api } from "../../api/api";
import { useUser } from "../../store/slices/hooks/useUser";

const Game = ({ name, video }) => {
  const [searchParams] = useSearchParams();
  const { userId } = useUser();
  const gameId = searchParams.get("id");
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  let [volume, setVolume] = useState(0.5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [time, setTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [error, setError] = useState(null);
  const [isTipOpen, setIsTipOpen] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const timerRef = useRef(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        if (!gameId) {
          setError("ID игры не указан");
          return;
        }

        const response = await api.getGame(gameId);
        if (response.data) {
          setGameData(response.data);
          setError(null);
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных игры:", error);
        setError("Ошибка при загрузке игры");
      }
    };

    fetchGameData();
  }, [gameId]);

  useEffect(() => {
    if (videoRef.current && gameData?.video_url) {
      videoRef.current.load();
    }
  }, [gameData?.video_url]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => {
      clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerChange = (e) => {
    setUserAnswer(e.target.value);
  };

  const checkAnswer = async () => {
    if (!gameId) {
      setError("ID игры не указан");
      setIsCorrect(false);
      return;
    }
    if (!userId) {
      setError("Ошибка: пользователь не авторизован");
      setIsCorrect(false);
      return;
    }
    if (!userAnswer) {
      setError("Введите ответ");
      setIsCorrect(false);
      return;
    }

    console.log(+userId);
    try {
      const response = await api.sendAnswer({
        game_id: gameId,
        answer: userAnswer,
        telegram_id: +userId,
      });

      if (response?.data?.success) {
        setIsCorrect(true);
        setIsTimerRunning(false);
        if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
        setError(null);
      } else {
        setIsCorrect(false);
        setError("Неправильный ответ, попробуйте еще раз!");
      }
    } catch (error) {
      console.error("Ошибка при отправке ответа:", error);
      setError("Ошибка при отправке ответа");
      setIsCorrect(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      if (videoRef.current.muted) {
        setVolume(0);
      } else {
        setVolume(videoRef.current.volume);
      }
    }
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) return;

    try {
      if (videoRef.current.paused) {
        if (!hasStartedRef.current) {
          setIsTimerRunning(true);
          hasStartedRef.current = true;
        }
        setIsPlaying(true);
        await videoRef.current.play();
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Ошибка воспроизведения:", error);
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current
          .requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch((err) => {
            console.error("Ошибка при переходе в полноэкранный режим:", err);
          });
      } else {
        document
          .exitFullscreen()
          .then(() => setIsFullscreen(false))
          .catch((err) => {
            console.error("Ошибка при выходе из полноэкранного режима:", err);
          });
      }
    }
  };

  const lockOrientation = (orientation) => {
    if (window.screen.orientation && window.screen.orientation.lock) {
      window.screen.orientation
        .lock(orientation)
        .then(() => {
          console.log(`Ориентация заблокирована: ${orientation}`);
        })
        .catch((err) => {
          console.error("Ошибка при блокировке ориентации:", err);
        });
    }
  };

  const unlockOrientation = () => {
    if (window.screen.orientation && window.screen.orientation.unlock) {
      window.screen.orientation.unlock();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleOrientationChange = () => {
      if (window.screen.orientation.type.startsWith("landscape")) {
        if (videoRef.current && !document.fullscreenElement) {
          videoRef.current.requestFullscreen().catch((err) => {
            console.error("Ошибка при переходе в полноэкранный режим:", err);
          });
          lockOrientation("landscape");
        }
      } else {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        lockOrientation("portrait");
      }
    };

    window.screen.orientation.addEventListener(
      "change",
      handleOrientationChange
    );

    return () => {
      window.screen.orientation.removeEventListener(
        "change",
        handleOrientationChange
      );
      unlockOrientation();
    };
  }, []);

  const handleTipClick = () => {
    setIsTipOpen(true);
    setCurrentTipIndex(0);
  };

  const handleNextTip = () => {
    if (gameData?.tips && currentTipIndex < gameData.tips.length - 1) {
      setCurrentTipIndex((prev) => prev + 1);
    } else {
      setIsTipOpen(false);
    }
  };

  const handleCloseTip = () => {
    setIsTipOpen(false);
  };

  return (
    <div className={styles.game}>
      <img src={blur} alt="" className={styles.blur__image} />
      <img src={blur} alt="" className={styles.blur__image__sec} />
      {isCorrect !== null && (
        <>
          <div className={`${styles.game__blur} ${styles.active}`} />
          <div className={`${styles.game__correct} ${styles.active}`}>
            <img
              src={isCorrect ? correct : incorrect}
              alt={isCorrect ? "Правильный ответ" : "Неправильный ответ"}
            />
            <p className={styles.correct_answer}>
              {isCorrect ? "Верно!" : "Ответ неверный!"}
            </p>
            <button onClick={() => setIsCorrect(null)} className={styles.retry}>
              Попробовать ещё раз
            </button>
          </div>
        </>
      )}
      <div
        className={`${styles.game__header} ${isCorrect ? styles.hidden : ""}`}
      >
        <h3 className={styles.game__title}>{gameData?.name || name}</h3>
        <div className={styles.timer}>
          <p>{formatTime(time)}</p>
        </div>
      </div>
      <div className={styles.videoContainer}>
        <video
          ref={videoRef}
          className={styles.game__video}
          muted={isMuted}
          volume={volume}
          controls={false}
          preload="auto"
          playsInline
          webkit-playsinline="true"
          x5-playsinline="true"
          x5-video-player-type="h5"
          x5-video-player-fullscreen="true"
          x5-video-orientation="portraint"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            backgroundColor: "#000",
          }}
        >
          <source src={gameData?.video_url || video} type="video/mp4" />
        </video>
        <Controlls
          handleVolumeChange={handleVolumeChange}
          volume={volume}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          isPlaying={isPlaying}
          toggleFullscreen={toggleFullscreen}
          togglePlayPause={togglePlayPause}
          toggleMute={toggleMute}
        />
        <p className={styles.game__description}>{gameData?.description}</p>
      </div>

      <div className={styles.game__controlls}>
        <input
          type="text"
          className={styles.answer__input}
          value={userAnswer}
          onChange={(e) => handleAnswerChange(e)}
        />
        <button className={styles.answer__button} onClick={checkAnswer}>
          Ответить
        </button>
      </div>
      {isTipOpen && (
        <div className={styles.tipOverlay}>
          <div className={styles.tipPopup}>
            <h3 className={styles.tipTitle}>Подсказка</h3>
            <p className={styles.tipContent}>
              {gameData?.tips?.[currentTipIndex]?.content}
            </p>
            <div className={styles.tipControls}>
              <button className={styles.tipButton} onClick={handleNextTip}>
                {currentTipIndex < gameData?.tips?.length - 1
                  ? "Следующая"
                  : "Закрыть"}
              </button>
              <button className={styles.closeButton} onClick={handleCloseTip}>
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
