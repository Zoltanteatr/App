import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./components/app/App";

import store from "./store/store";

import "./index.scss";

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={new QueryClient()}>
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </QueryClientProvider>
);
