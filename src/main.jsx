<<<<<<< HEAD
import React from "react";
import ReactDOM from "react-dom/client";
=======
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
>>>>>>> 7ff153fd9903c7bdd2dfd4b33e67df74f3f33c8f
import { BrowserRouter } from "react-router-dom";
import "./styles.css";
import App from "./App";

<<<<<<< HEAD
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
=======
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
>>>>>>> 7ff153fd9903c7bdd2dfd4b33e67df74f3f33c8f
);
