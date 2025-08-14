import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { api } from "../../api/api";
import { useUser } from "../../store/slices/hooks/useUser";
import { getUserIdFromAddress } from "../../helpers/getUserIdFromAddress";

import Main from "../main/Main";
import Layout from "../layout/Layout";
import Profile from "../profile/Profile";
import Support from "../support/Support";
import Intro from "../intro/Intro";
import Leads from "../leads/Leads";
import Instruction from "../instruction/Instruction";
import Game from "../game/Game";
import DemoGame from "../demoGame/demoGame";

const App = () => {
  const { name, video } = useSelector((state) => state.game);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    userName,
    userAvatar,
    setUser,
    userPhone,
    userEmail,
    UserPts,
    ...user
  } = useUser();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = getUserIdFromAddress();
        if (!userId) {
          setError("Ошибка авторизации");
          return;
        }

        const response = await api.getCurrentUser(userId);
        const resultsResponse = await api.getUserResults(userId);

        if (response.data) {
          setUser({
            ...user,
            userAvatar: response.data.avatar_url,
            userName:
              response.data.first_name ||
              response.data.username ||
              "Пользователь",
            userPhone: response.data.phone,
            userEmail: response.data.email,
            userPts: response.data.balance,
            userId: userId,
            subscription: response.data.subscription,
            bougth_games: response.data.bougth_games,
            results: resultsResponse.data,
          });

          sessionStorage.setItem("user_id", userId);
          setError(null);
        }
      } catch (err) {
        console.error("Ошибка загрузки пользователя:", err);
        setError("Ошибка при загрузке данных пользователя");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/intro" />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/support" element={<Support />} />
        <Route path="/intro" element={<Intro />} />
        <Route path="/game" element={<Game name={name} video={video} />} />
        <Route path="/lead/:gameId" element={<Leads />} />
        <Route path="/info" element={<Instruction />} />
        <Route path="/demo-game" element={<DemoGame />} />
        <Route path="/main" element={<Main />} />
      </Route>
    </Routes>
  );
};

export default App;
