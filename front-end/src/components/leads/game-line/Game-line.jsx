import "swiper/scss/navigation";
import "swiper/scss/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import clsx from "clsx";

import styles from "./game-line.module.scss";

const GameLine = ({ games, onGameSelect, selectedGameId }) => {
  if (!games || games.length === 0) {
    return <div className={styles.empty}>Нет доступных игр</div>;
  }

  return (
    <Swiper
      spaceBetween={20}
      slidesPerView="2"

      loop={true}
      scrollbar={{ draggable: true }}
      className={styles.game__swiper}
    >
      {games.map((game) => (
        <SwiperSlide
          key={game.id}
          className={clsx(styles.game, {
            [styles.selected]: game.id === selectedGameId
          })}
          onClick={() => onGameSelect(game.id)}
        >
          {game.name}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default GameLine;
