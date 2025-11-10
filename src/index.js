import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./MainPage";
import NBAPage from "./NBAPage";
import WNBAPage from "./WNBAPage";

const DEFAULT_THRESHOLDS = {
  hotFg: 50.0,
  coldFg: 40.0,
  hot3fg: 40.0,
  cold3fg: 30.0,
};

function getPlayerImageUrl(playerId) {
  return playerId ? `https://cdn.nba.com/headshots/nba/latest/260x190/${playerId}.png` : null;
}

function normalizePlayerData(obj) {
  return {
    player_id: obj.player_id ?? obj.PERSON_ID ?? obj.id ?? null,
    name: obj.name ?? obj.player_name ?? obj.DISPLAY_FIRST_LAST ?? obj.player ?? "Unknown",
    team: obj.team ?? obj.TEAM_ABBREVIATION ?? obj.team_abbr ?? "",
    fg_pct: obj.fg_pct ?? obj.agg_fg_pct ?? obj.avg_fg_pct ?? obj.FG_PCT ?? 0,
    fg3_pct: obj.fg3_pct ?? obj.agg_3p_pct ?? obj.avg_3p_pct ?? obj.FG3_PCT ?? 0,
    games_played: obj.games_played ?? obj.games_sampled ?? obj.sample_games ?? null,
    fgm: obj.fgm ?? null,
    fga: obj.fga ?? null,
    fg3m: obj.fg3m ?? null,
    fg3a: obj.fg3a ?? null,
  };
}

function PlayerImage({ playerId, name }) {
  const [imgError, setImgError] = useState(false);
  const imgUrl = getPlayerImageUrl(playerId);

  if (imgUrl && !imgError) {
    return (
      <img
        src={imgUrl}
        alt={name}
        className="player-image"
        onError={() => setImgError(true)}
      />
    );
  }

  const initials = name ? name.split(" ").map(n => n[0]).slice(0, 2).join("") : "?";
  return (
    <div className="player-initials">
      {initials}
    </div>
  );
}

function StatDisplay({ label, value, details, color, showPercent = true }) {
  return (
    <div className="stat-display">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color }}>
        {value}{showPercent ? '%' : ''}
      </div>
      {details && <div className="stat-details">{details}</div>}
    </div>
  );
}

function StreakCard({ player, isHot }) {
  const normalized = normalizePlayerData(player);
  const cardClass = `streak-card ${isHot ? 'hot' : 'cold'}`;

  return (
    <div className={cardClass}>
      <div className="player-image-container">
        <PlayerImage playerId={normalized.player_id} name={normalized.name} />
      </div>

      <div className="card-content">
        <div className="player-name">{normalized.name}</div>
        <div className="player-team">{normalized.team}</div>

        <div className="stats-container">
          <StatDisplay
            label="FG%"
            value={normalized.fg_pct}
            details={normalized.fgm !== null ? `${normalized.fgm}/${normalized.fga}` : null}
            color={isHot ? '#ff6b35' : '#2196f3'}
          />
          <StatDisplay
            label="3P%"
            value={normalized.fg3_pct}
            details={normalized.fg3m !== null ? `${normalized.fg3m}/${normalized.fg3a}` : null}
            color={isHot ? '#ff6b35' : '#2196f3'}
          />
          {normalized.games_played && (
            <StatDisplay
              label="Games"
              value={normalized.games_played}
              color="#999"
              showPercent={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Controls({ 
  games, setGames, 
  limit, setLimit, 
  statType, setStatType,
  mode, setMode,
  showAll, setShowAll
}) {
  return (
    <div className="controls">
      <label>
        <span className="control-label">Streak window:</span>
        <select value={games} onChange={(e) => setGames(Number(e.target.value))} className="control-select">
          <option value={10}>10 games</option>
          <option value={15}>15 games</option>
          <option value={20}>20 games</option>
        </select>
      </label>

      <label>
        <span className="control-label">Players limit:</span>
        <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="control-select">
          <option value={10}>10 (Fast)</option>
          <option value={20}>20 (Fast)</option>
          <option value={50}>50 (Recommended)</option>
          <option value={100}>100 (All Players - Slower)</option>
          <option value={0}>Unlimited (Slowest)</option>
        </select>
      </label>

      <label>
        <span className="control-label">Stat type:</span>
        <select value={statType} onChange={(e) => setStatType(e.target.value)} className="control-select">
          <option value="fg">Field Goal %</option>
          <option value="3p">3-Point %</option>
        </select>
      </label>

      <div className="controls-right">
        <label className="checkbox-label">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
          <span>Show All Qualified</span>
        </label>
        
        <button onClick={() => setMode("both")} className={`control-button ${mode === "both" ? "active" : ""}`}>Both</button>
        <button onClick={() => setMode("hot")} className={`control-button ${mode === "hot" ? "active" : ""}`}>Hot</button>
        <button onClick={() => setMode("cold")} className={`control-button ${mode === "cold" ? "active" : ""}`}>Cold</button>
      </div>
    </div>
  );
}

function ThresholdControls({ 
  statType,
  hotFgMin, setHotFgMin,
  coldFgMax, setColdFgMax,
  hot3fgMin, setHot3fgMin,
  cold3fgMax, setCold3fgMax,
  min3pAttempts, setMin3pAttempts,
  onReset
}) {
  return (
    <div className="threshold-controls">
      <div className="threshold-label">Thresholds:</div>
      
      {statType === "fg" ? (
        <>
          <label className="threshold-input-group">
            <span className="threshold-text">Hot FG% ≥</span>
            <input
              type="number"
              value={hotFgMin}
              onChange={(e) => setHotFgMin(Number(e.target.value))}
              className="threshold-input"
              min="0"
              max="100"
              step="0.1"
            />
            <span className="threshold-text">%</span>
          </label>
          
          <label className="threshold-input-group">
            <span className="threshold-text">Cold FG% ≤</span>
            <input
              type="number"
              value={coldFgMax}
              onChange={(e) => setColdFgMax(Number(e.target.value))}
              className="threshold-input"
              min="0"
              max="100"
              step="0.1"
            />
            <span className="threshold-text">%</span>
          </label>
        </>
      ) : (
        <>
          <label className="threshold-input-group">
            <span className="threshold-text">Hot 3PT% ≥</span>
            <input
              type="number"
              value={hot3fgMin}
              onChange={(e) => setHot3fgMin(Number(e.target.value))}
              className="threshold-input"
              min="0"
              max="100"
              step="0.1"
            />
            <span className="threshold-text">%</span>
          </label>
          
          <label className="threshold-input-group">
            <span className="threshold-text">Cold 3PT% ≤</span>
            <input
              type="number"
              value={cold3fgMax}
              onChange={(e) => setCold3fgMax(Number(e.target.value))}
              className="threshold-input"
              min="0"
              max="100"
              step="0.1"
            />
            <span className="threshold-text">%</span>
          </label>
          
          <label className="threshold-input-group">
            <span className="threshold-text">Min 3PT Att/Game ≥</span>
            <input
              type="number"
              value={min3pAttempts}
              onChange={(e) => setMin3pAttempts(Number(e.target.value))}
              className="threshold-input"
              min="0"
              max="20"
              step="0.5"
            />
          </label>
        </>
      )}
      
      <button onClick={onReset} className="threshold-reset-button">
        Reset Defaults
      </button>
    </div>
  );
}

function HomeContent() {
  const [streaks, setStreaks] = useState({ hot_fg: [], cold_fg: [], hot_3p: [], cold_3p: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [playersFetched, setPlayersFetched] = useState(0);
  const [thresholds, setThresholds] = useState(null);

  const [games, setGames] = useState(10);
  const [limit, setLimit] = useState(50);
  const [mode, setMode] = useState("both");
  const [statType, setStatType] = useState("fg");
  const [showAll, setShowAll] = useState(false);

  const [hotFgMin, setHotFgMin] = useState(DEFAULT_THRESHOLDS.hotFg);
  const [coldFgMax, setColdFgMax] = useState(DEFAULT_THRESHOLDS.coldFg);
  const [hot3fgMin, setHot3fgMin] = useState(DEFAULT_THRESHOLDS.hot3fg);
  const [cold3fgMax, setCold3fgMax] = useState(DEFAULT_THRESHOLDS.cold3fg);
  const [min3pAttempts, setMin3pAttempts] = useState(1.0);

  useEffect(() => {
    const fetchStreaks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const url = new URL('http://localhost:8000/api/streaks/');
        url.searchParams.set('games', games);
        url.searchParams.set('limit', limit);
        url.searchParams.set('hot_fg_min', hotFgMin);
        url.searchParams.set('cold_fg_max', coldFgMax);
        url.searchParams.set('hot_3fg_min', hot3fgMin);
        url.searchParams.set('cold_3fg_max', cold3fgMax);
        url.searchParams.set('min_3p_attempts', min3pAttempts);
        url.searchParams.set('show_all', showAll);
        
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        
        const data = await res.json();

        setStreaks({
          hot_fg: data.hot_fg_streaks || [],
          cold_fg: data.cold_fg_streaks || [],
          hot_3p: data.hot_3p_streaks || [],
          cold_3p: data.cold_3p_streaks || [],
        });
        setFromCache(data.from_cache || false);
        setPlayersFetched(data.players_fetched || 0);
        setThresholds(data.thresholds || null);
      } catch (err) {
        setError(err.message || String(err));
        setStreaks({ hot_fg: [], cold_fg: [], hot_3p: [], cold_3p: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchStreaks();
  }, [games, limit, hotFgMin, coldFgMax, hot3fgMin, cold3fgMax, min3pAttempts, showAll]);

  const resetThresholds = () => {
    setHotFgMin(DEFAULT_THRESHOLDS.hotFg);
    setColdFgMax(DEFAULT_THRESHOLDS.coldFg);
    setHot3fgMin(DEFAULT_THRESHOLDS.hot3fg);
    setCold3fgMax(DEFAULT_THRESHOLDS.cold3fg);
    setMin3pAttempts(1.0);
  };

  const getDisplayedPlayers = () => {
    const hotKey = statType === "fg" ? "hot_fg" : "hot_3p";
    const coldKey = statType === "fg" ? "cold_fg" : "cold_3p";
    
    const hot = (streaks[hotKey] || []).map(p => ({ ...p, _isHot: true }));
    const cold = (streaks[coldKey] || []).map(p => ({ ...p, _isHot: false }));
    
    if (mode === "hot") return hot;
    if (mode === "cold") return cold;
    return [...hot, ...cold];
  };

  const displayed = getDisplayedPlayers();

  return (
    <div className="page-container">
      <h1 className="page-title">NBA Hot & Cold Streaks</h1>

      <Controls
        games={games} setGames={setGames}
        limit={limit} setLimit={setLimit}
        statType={statType} setStatType={setStatType}
        mode={mode} setMode={setMode}
        showAll={showAll} setShowAll={setShowAll}
      />

      <ThresholdControls
        statType={statType}
        hotFgMin={hotFgMin} setHotFgMin={setHotFgMin}
        coldFgMax={coldFgMax} setColdFgMax={setColdFgMax}
        hot3fgMin={hot3fgMin} setHot3fgMin={setHot3fgMin}
        cold3fgMax={cold3fgMax} setCold3fgMax={setCold3fgMax}
        min3pAttempts={min3pAttempts} setMin3pAttempts={setMin3pAttempts}
        onReset={resetThresholds}
      />

      {loading ? (
        <div className="loading-container">
          <img src="/basktball2.gif" alt="Loading" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '8px' }} />
          <p>Loading streaks...</p>
          {limit >= 100 && (
            <p className="loading-subtext">
              Analyzing {limit === 0 ? '100+' : limit} players, this may take 10-30 seconds...
            </p>
          )}
        </div>
      ) : error ? (
        <div className="error-container">
          <strong>Error:</strong> {error}
          <br />
          <small className="error-hint">
            Make sure your FastAPI backend is running on http://127.0.0.1:8000
          </small>
        </div>
      ) : (
        <>
          <h2 className="page-subtitle">
            Showing {mode === "both" ? "Hot & Cold" : mode === "hot" ? "Hot" : "Cold"} streaks - {" "}
            {statType === "fg" ? "Field Goal" : "3-Point"} % over {games} games
            {showAll && <span className="badge">All Qualified</span>}
            {fromCache && <span className="badge">Cached</span>}
            {playersFetched > 0 && <span className="badge-subtle">({playersFetched} players checked)</span>}
          </h2>

          {displayed.length === 0 ? (
            <div className="empty-state">
              <p>No streak data found matching the current thresholds</p>
              <p className="empty-state-hint">
                Try adjusting the threshold values or increasing the player limit
              </p>
            </div>
          ) : (
            <div className="cards-grid">
              {displayed.map((p, idx) => (
                <StreakCard key={idx} player={p} isHot={p._isHot} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route index element={<HomeContent />} />
          <Route path="nba/*" element={<NBAPage />} />
          <Route path="wnba/*" element={<WNBAPage />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);