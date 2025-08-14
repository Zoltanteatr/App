import { io } from "socket.io-client";
import axios from "axios";

const $api = axios.create({
  baseURL: "https://zoltansgametma.ru/api",
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

$api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API Error:",
      error.config.url,
      error.response?.status,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

export const api = {
  getCurrentUser: (user_id) => $api.get(`/auth/me?user_id=${user_id}`),
  getUserResults: (user_id) => $api.get(`/auth/me/results?user_id=${user_id}`),
  syncUser: () => $api.patch("/auth/me/sync"),
  updateUser: (data) => $api.patch("/auth/me/update", data),

  getGames: (params = { until_today: false, limit: 2 }) =>
    $api.get("/games/", { params }),
  getGame: (gameId) => $api.get(`/games/${gameId}`),
  getDemoGames: () => $api.get(`/games/demo`),
  getDemoGame: (demoGameId) => $api.get(`/games/demo/${demoGameId}`),
  getLeaders: (gameId) => $api.get(`/games/${gameId}/leaderboard`),
  sendAnswer: (data) =>
    $api.post(`/games/${data.game_id}/answer`, {
      answer: data.answer,
      telegram_id: data.telegram_id,
    }),
};

export const socket = io("wss://zoltansgametma.ru/chat", {
  path: "/socket.io",
  autoConnect: false,
});

export const chatApi = {
  connect: (userId) => {
    socket.emit("auth", { user_id: userId });
    socket.connect();
  },

  disconnect: () => {
    socket.disconnect();
  },

  uploadChatPhoto: (formData, sid) => {
    return $api.post(`/auth/chat/photo?sid=${sid}`, formData);
  },

  startSearch: () => {
    socket.emit("search");
  },

  sendMessage: (text) => {
    socket.emit("send_message", { text });
  },

  closeChat: () => {
    socket.emit("chat-close");
  },

  onAuthSuccess: (callback) => {
    socket.on("auth-success", callback);
  },

  onError: (callback) => {
    socket.on("error", callback);
  },

  onSearchStarted: (callback) => {
    socket.on("search-started", callback);
  },

  onChatFound: (callback) => {
    socket.on("chat-found", callback);
  },

  onNewMessage: (callback) => {
    socket.on("new-message", callback);
  },

  onChatClosed: (callback) => {
    socket.on("chat-closed", callback);
  },

  offAll: () => {
    socket.off("auth-success");
    socket.off("error");
    socket.off("search-started");
    socket.off("chat-found");
    socket.off("new-message");
    socket.off("chat-closed");
  },
};
