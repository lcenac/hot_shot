import WPlayerList from "./WPlayerList";
import WPlayerDetail from "./WPlayerDetail";
import { Routes, Route } from "react-router-dom";

function WNBAPage() {
  return (
    <div className="container mt-5">
      <Routes>
        {/* Default route → Player List */}
        <Route index element={<WPlayerList />} />

        {/* Player Detail route */}
        <Route path="player/:id" element={<WPlayerDetail />} />
      </Routes>
    </div>
  );
}

export default WNBAPage;