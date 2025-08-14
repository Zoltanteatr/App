import { useEffect, useState } from "react";
import Player from "./player/Player";
import GameLine from "./game-line/Game-line";
import clsx from "clsx";
import { api } from "../../api/api"

import styles from "./leads.module.scss";

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const Leads = () => {
  const [leaders, setLeaders] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGameId, setSelectedGameId] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await api.getGames();
        if (response.data) {
          setGames(response.data);
          // Выбираем первую игру по умолчанию
          if (response.data.length > 0) {
            setSelectedGameId(response.data[0].id);
          }
        }
      } catch (err) {
        console.error("Ошибка загрузки списка игр:", err);
      }
    };
    fetchGames();
  }, []);

  useEffect(() => {
    const fetchLeaders = async () => {
      if (!selectedGameId) return;
      
      setLoading(true);
      try {
        const response = await api.getLeaders(selectedGameId);
        if (response.data) {
          setLeaders(response.data);
        } else {
          setError("Таблица лидеров пуста");
        }
      } catch (err) {
        setError("Ошибка загрузки таблицы лидеров");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, [selectedGameId]);

  const handleGameSelect = (gameId) => {
    setSelectedGameId(gameId);
  };

  const getUserName = (leader) => {
    if (!leader?.user) return "Игрок";
    return leader.user.first_name || leader.user.username || "Игрок";
  };

  return (
    <div className={styles.leads}>
      <div className={styles.leads__body}>
        <div className={styles.leads__header}>
          <p className={styles.leads__title}>Таблица лидеров</p>

          <div className={styles.game__line}>
            <GameLine games={games} onGameSelect={handleGameSelect} selectedGameId={selectedGameId} />
          </div>
        </div>

        <section className={styles.table}>
          <div className={styles.table__header}>
            <p className={clsx(styles.table__place, styles.first)}>Место</p>
            <p className={clsx(styles.table__place, styles.second)}>
              Имя игрока
            </p>
            <p className={clsx(styles.table__place, styles.third)}>Время</p>
            <p className={clsx(styles.table__place, styles.fourth)}>Очки</p>
          </div>

          <div className={styles.table__body}>
            {loading ? (
              <p className={styles.loading}>Загрузка...</p>
            ) : error ? (
              <p className={styles.error}>{error}</p>
            ) : leaders.length > 0 ? (
              leaders.map((leader) => (
                <Player 
                  key={leader.id} 
                  place={leader.place || 0}
                  name={getUserName(leader)}
                  time={formatTime(leader.created_at)}
                  points={leader.points || 0}
                />
              ))
            ) : (
              <div className={styles.leaders__empty}>Лидеров пока нет</div>
            )}
          </div>
        </section>
      </div>  
    </div>
  );
};

export default Leads;
