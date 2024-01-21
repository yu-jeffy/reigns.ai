import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Game from "./pages/Game";
import Landing from "./pages/Landing";
import Settings from "./pages/Settings";
import { GameProvider } from "./Data";

export default function App() {
  return (
    <div>
      <GameProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />}/>
            <Route path="/settings" element={<Settings />}/>
            <Route path="/play" element={<Game />}/>
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </div>
  );
}