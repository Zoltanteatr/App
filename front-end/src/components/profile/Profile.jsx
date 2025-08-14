import { useState, useEffect } from "react";
import clsx from "clsx";
import pencil from "../../img/pencil.svg";

import styles from "./profile.module.scss";
import userDefault from "../../img/userdef.svg";
import { useUser } from "../../store/slices/hooks/useUser";
import { api } from "../../api/api";
import { getUserIdFromAddress } from "../../helpers/getUserIdFromAddress";
import ProfileGames from "./profileGames/profileGames";

const Profile = () => {
  const {
    userName,
    userAvatar,
    userId,
    setUser,
    userPhone,
    userEmail,
    userGames,
    subscription,
    bougth_games,
    results,
    ...user
  } = useUser();

  const [filter, setFilter] = useState("not_passed");
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(userPhone || "");
  const [email, setEmail] = useState(userEmail || "");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = getUserIdFromAddress();
        if (!userId) {
          return;
        }

        const userResponse = await api.getCurrentUser(userId);
        if (userResponse.data) {
          setUser({
            ...user,
            userPhone: userResponse.data.phone || null,
            userEmail: userResponse.data.email || null,
            userAvatar: userResponse.data.avatar_url || null,
            userName:
              userResponse.data.first_name ||
              userResponse.data.username ||
              "Пользователь",
            subscription: userResponse.data.subscription || null,
          });
          setPhone(userResponse.data.phone || "");
          setEmail(userResponse.data.email || "");
        }
      } catch (err) {
        console.error("Ошибка при загрузке данных пользователя:", err);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!userId) {
        console.error("user_id не найден в состоянии");
        return;
      }

      const updateData = {
        user_id: userId,
        phone: phone || null,
        email: email || null,
      };

      await api.updateUser(updateData);

      setUser({
        ...user,
        userPhone: phone || null,
        userEmail: email || null,
      });

      setIsEditing(false);
    } catch (err) {
      setError("Ошибка сохранения настроек");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;

    if (/^\d*$/.test(value) && value.length <= 11) {
      setPhone(value);
    }
  };

  const unixTime = subscription
    ? Math.floor(new Date(subscription.expire).getTime())
    : 0;
  const currentDate = new Date().getTime();

  return (
    <div className={styles.profile}>
      <div className={styles.profile__info}>
        <div
          className={clsx(
            styles.profile__avatar,
            !userAvatar && styles.user__def
          )}
        >
          <img src={userDefault} alt="" className={styles.profile__avatar} />
        </div>
        <p className={styles.user__name}>{userName}</p>

        {isEditing ? (
          <>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              className={styles.input}
              placeholder="Введите номер телефона"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="Введите email"
            />
            <button className={styles.save__btn} onClick={handleSave}>
              Сохранить
            </button>
          </>
        ) : (
          <>
            <div className={styles.user__info}>
              {phone || "Номер не указан"}
            </div>
            <div className={styles.user__info}>
              {email || "Email не указан"}
            </div>
          </>
        )}

        <div
          className={styles.edit__btn}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Отмена" : "Редактировать профиль"}
          {!isEditing && (
            <img src={pencil} alt="" className={styles.edit__img} />
          )}
        </div>
        {subscription && unixTime < currentDate ? (
          <a href="https://t.me/Zoltansgame_bot" className={styles.buy__btn}>
            Купить подписку
          </a>
        ) : null}

        <div className={styles.games}>
          <p className={styles.games__title}>Список игр</p>
          <div className={styles.games__controller}>
            <div
              className={clsx(
                styles.controller,
                filter === "not_passed" && styles.active
              )}
              onClick={() => setFilter("not_passed")}
            >
              Не пройденные
            </div>
            <div
              className={clsx(
                styles.controller,
                filter === "passed" && styles.active
              )}
              onClick={() => setFilter("passed")}
            >
              Пройденные
            </div>
          </div>

          {filter === "not_passed" && (
            <ProfileGames
              games={bougth_games.filter(
                (g) => !results.some((r) => r.game.id === g.id)
              )}
              category="not_passed"
            />
          )}

          {filter === "passed" && (
            <ProfileGames games={results.map((r) => r.game)} category="prev" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
