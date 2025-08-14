import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/scss";
import "swiper/scss/navigation";
import "swiper/scss/pagination";

import styles from "./demo-games.module.scss";
import Button from "../../@ui/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import { openPopup } from "../../../store/slices/popupSlice";
import { setOpen } from "../../../store/slices/demoSlice";

const DemoGames = () => {
  const dispatch = useDispatch();
  const { games } = useSelector((state) => state.demo);

  const handleTipClick = (game) => {
    dispatch(
      openPopup({
        type: "tip",
        name: game.name,
        description: game.description || "Описание отсутствует",
      })
    );
  };

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      slidesPerView={1}
      spaceBetween={30}
      loop={true}
      speed={800}
      grabCursor={true}
      className={styles.game__swiper}
      watchSlidesProgress={true}
      observer={true}
      observeParents={true}
    >
      {games.map((game) => (
        <SwiperSlide className={styles.slide} key={game.id}>
          <div className={styles.game}>
            <h3 className={styles.game__name}>{game.name}</h3>
            <img
              src={game.preview}
              className={styles.game__preview}
              alt={game.name}
              width="100%"
              height="auto"
              loading="lazy"
            />
            <div className={styles.buttons}>
              <Button
                buttonClass="buy__btn"
                buttonContent="Играть"
                onClick={() => dispatch(setOpen(true))}
                to="/demo-game"
              >
                Играть
              </Button>
              <Button
                buttonClass="buy__btn"
                buttonContent="Описание"
                secondClass="info__btn"
                onClick={() => handleTipClick(game)}
              >
                Описание
              </Button>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default DemoGames;
