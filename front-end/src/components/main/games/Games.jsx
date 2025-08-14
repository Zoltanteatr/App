import "swiper/scss";
import "swiper/scss/navigation";
import "swiper/scss/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { useEffect, useState } from "react";
import styles from "./games.module.scss";
import Button from "../../@ui/Button/Button";
import { api } from "../../../api/api";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useDispatch } from "react-redux";
import { openPopup } from "../../../store/slices/popupSlice";

const Games = ({ category }) => {
  const dispatch = useDispatch();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleTipClick = (game) => {
    dispatch(
      openPopup({
        type: "tip",
        name: game.name,
        description: game.description || "Описание отсутствует",
      })
    );
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await api.getGames();

        if (Array.isArray(response.data)) {
          const cleanedGames = response.data.map((game) => ({
            ...game,
            dateObj: new Date(game.date),
          }));

          setGames(cleanedGames);
        } else {
          setError("Неверный формат данных");
        }
      } catch (err) {
        console.error("Ошибка загрузки:", err);
        setError("Ошибка при загрузке игр");
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const handleBuyClick = async (gameId) => {
    try {
      const response = await api.getGame(gameId);
      const buyUrl = response.data.buy_url;
      if (buyUrl) {
        window.location.href = buyUrl;
      } else {
        alert("Ссылка для покупки недоступна.");
      }
    } catch (error) {
      console.error("Ошибка при получении игры:", error);
      alert("Не удалось получить ссылку на игру.");
    }
  };

  const now = new Date().getTime();

  const filteredGames = games.filter((game) => {
    if (category === "all") return true;
    if (category === "test") return game.is_test;

    const date = new Date(game.date);
    const unixTime = date.getTime();

    const isPast = unixTime > now;
    return category === "prev"
      ? isPast && !game.is_test
      : !isPast && !game.is_test;
  });

  if (loading) return <div className={styles.loading}>Загрузка игр...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (filteredGames.length === 0) {
    return <div className={styles.empty}></div>;
  }

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      slidesPerView={1}
      spaceBetween={30}
      loop={true}
      navigation={{
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      }}
      pagination={{
        clickable: true,
        dynamicBullets: true,
        renderBullet: function (index, className) {
          return '<span class="' + className + '"></span>';
        },
      }}
      breakpoints={{
        320: { slidesPerView: 1 },
        768: { slidesPerView: 1 },
        1024: { slidesPerView: 1 },
      }}
      speed={800}
      grabCursor={true}
      className={styles.game__swiper}
      watchSlidesProgress={true}
      observer={true}
      observeParents={true}
    >
      {filteredGames.map((game, index) => (
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
                buttonContent={
                  index === 2
                    ? `${game.price} ₽ <span>1000 ₽</span>`
                    : `${game.price} ₽`
                }
                buttonClass="buy__btn"
                onClick={() => handleBuyClick(game.id)}
                isHtml={true}
              />
              <Button
                buttonClass="buy__btn"
                buttonContent="Об игре"
                secondClass="info__btn"
                onClick={() => handleTipClick(game)}
              />
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default Games;
