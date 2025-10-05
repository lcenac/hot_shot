// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './MainPage';
import NBAPage from './NBAPage';
import WNBAPage from './WNBAPage';
// import WPlayerDetails from './WPlayerDetail';

// All your “main page content” goes in a separate component
import  { useState, useEffect } from "react";

function HomeContent() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Example API call to your backend
    fetch("/api/scoreboard") // replace with your actual backend endpoint
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        setGames(data.games); // adjust based on your JSON structure
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching games:", error);
        setLoading(false);
      });
  }, []); // empty dependency array → runs only once on mount

  if (loading) {
    return <p>Loading upcoming games...</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to Hot Shot 🔥</h1>
      <h2>Upcoming Games</h2>
      {games.length === 0 ? (
        <p>No games found</p>
      ) : (
        <ul>
          {games.map((game) => (
            <li key={game.gameId}>
              {game.awayTeam.teamTricode} @ {game.homeTeam.teamTricode} -{" "}
              {game.gameStatusText}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HomeContent;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />}>
          {/* Index route shows only on "/" */}
          <Route index element={<HomeContent />} />
          <Route path="nba/*" element={<NBAPage />} />
          <Route path="wnba/*" element={<WNBAPage />} />
          {/* <Route path="wnba/player/:id" element={<WPlayerDetails />} /> */}
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);
