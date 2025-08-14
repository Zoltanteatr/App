import Play from "../../../img/play-stop.svg";
import fullscreen from "../../../img/fullscreen.svg";
import volumeImg from "../../../img/voulme.svg";
import clsx from "clsx";

import styles from "./controlls.module.scss";

const Controlls = ({
  togglePlayPause,
  toggleMute,
  toggleFullscreen,
  isPlaying,
  isMuted,
  isFullscreen,
  volume,
  handleVolumeChange,
}) => {
  return (
    <div className={styles.controlls}>
      <img
        src={Play}
        alt=""
        onClick={togglePlayPause}
        className={clsx(
          styles.play__controll,
          isPlaying ? styles.playing : styles.stopped
        )}
      />
      <div className={styles.bottom__controlls}>
        <div className={styles.vol}>
          <img src={volumeImg} alt="" className={styles.voulme__img} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className={styles.game__volume}
          />
        </div>

        <img
          src={fullscreen}
          alt=""
          onClick={toggleFullscreen}
          className={styles.fullscreen}
        />
      </div>
    </div>
  );
};
export default Controlls;
