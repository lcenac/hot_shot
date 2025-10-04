import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './MainPage';
import NBAPage from './NBAPage';
import WNBAPage from './WNBAPage';
// import WPlayerList from './WPlayerList';
import WPlayerDetails from './WPlayerDetail';



const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route index element={<div style={{ padding: "2rem" }}><h1>Welcome to Hot Shot 🔥</h1></div>} />
          <Route path="nba/*" element={<NBAPage />} />
          <Route path="wnba/*" element={<WNBAPage />} />
          <Route path="/wnba/player/:id" element={<WPlayerDetails />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);
