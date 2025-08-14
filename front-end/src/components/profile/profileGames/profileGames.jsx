import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import styles from "./profileGames.module.scss";
import Button from "../../@ui/Button/Button";
import { useDispatch } from "react-redux";
import { openPopup } from "../../../store/slices/popupSlice";
import { useNavigate } from "react-router-dom";

const ProfileGames = ({ games, category }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  if (!games || games.length === 0) return null;

  const handlePlayClick = (gameId) => {
    navigate(`/game?id=${gameId}`);
  };

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
      loop
      navigation={{
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      }}
      pagination={{
        clickable: true,
        dynamicBullets: true,
        renderBullet: (index, className) =>
          `<span class="${className}"></span>`,
      }}
      breakpoints={{
        320: { slidesPerView: 1 },
        768: { slidesPerView: 1 },
        1024: { slidesPerView: 1 },
      }}
      speed={800}
      grabCursor
      className={styles.game__swiper}
      watchSlidesProgress
      observer
      observeParents
    >
      {games.map((game) => (
        <SwiperSlide className={styles.slide} key={game.id}>
          <div className={styles.game}>
            <h3 className={styles.game__name}>{game.name}</h3>
            <p className={styles.game__date}>
              Дата: {new Date(game.date).toLocaleDateString()}
            </p>

            {game.photo_url && (
              <img
                src={game.photo_url}
                className={styles.game__preview}
                width="100%"
                height="auto"
                alt={game.name}
                loading="lazy"
              />
            )}

            <div className={styles.buttons}>
              <Button
                onClick={() => handlePlayClick(game.id)}
                buttonContent="Играть"
                buttonClass="buy__btn"
              >
                {category === "prev" ? "Перепройти" : "Играть"}
              </Button>
              <Button
                buttonClass="buy__btn"
                buttonContent="Об игре"
                secondClass="info__btn"
                onClick={() => handleTipClick(game)}
              >
                Описание игры
              </Button>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ProfileGames;
