import { createSlice } from "@reduxjs/toolkit";

const gameState = {
  name: "Игра 1",
  video: "https://www.youtube.com/embed/wqeGPX7TRv0",
};
const gameSlice = createSlice({
  name: "game",
  initialState: gameState,
  reducers: {},
});

export default gameSlice.reducer;
