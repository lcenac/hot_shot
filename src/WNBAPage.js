import PlayerList from "./PlayerList";
import PlayerDetail from "./PlayerDetail";
import { Routes, Route } from "react-router-dom";

function WNBAPage() {
  return (
    <div className="container mt-5">
      <Routes>
        {/* Default: Player List */}
        <Route index element={<PlayerList />} />

        {/* Player Detail */}
        <Route path="player/:id" element={<PlayerDetail />} />
      </Routes>
    </div>
  );
}

export default WNBAPage;