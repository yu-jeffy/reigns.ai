import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Game from "./pages/Game";
import Settings from "./pages/Settings";
import { GameProvider } from "./Data";

export default function App() {
  return (
    <div>
      <GameProvider>
        <BrowserRouter>
          <Routes>
            <Route exact path="/" element={<Settings />}>
            </Route>
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </div>
  );
}