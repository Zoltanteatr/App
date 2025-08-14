import { createSlice } from "@reduxjs/toolkit";

const gamesState = {
      gameName: "",
      gameState: "",
      gameDescription: "",
      gameDate: "",
      gamePreview: "",
      gamePrice: "",
};
const gamesSlice = createSlice({
  name: "games",
  initialState: gamesState,
  reducers: {},
});

export const { setGame } = gamesSlice.actions;

export default gamesSlice.reducer;
