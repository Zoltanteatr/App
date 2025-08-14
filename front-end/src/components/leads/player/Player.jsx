import clsx from "clsx";

import styles from "./player.module.scss";


const PLACE_STYLES = {
  1: styles.first,
  2: styles.second,
  3: styles.third,
};

const truncateName = (name, maxLength = 10) => {
  if (name.length <= maxLength) return name;
  return `${name.slice(0, maxLength)}...`;
};

const Player = ({ place, name, time, points, avatar }) => {
  const truncatedName = truncateName(name);
  
  return (
    <div className={clsx(styles.player, PLACE_STYLES[place])}>
      <p className={styles.place}>{place}</p>
      <div className={styles.name}>
        <span className={styles.username} title={name}>{truncatedName}</span>
      </div>
      <p className={styles.time}>{time}</p>
      <p className={styles.points}>{points}</p>
    </div>
  );
};
export default Player;
