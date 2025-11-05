// // index.js
// import React, { useState, useEffect } from "react";
// import ReactDOM from "react-dom/client";
// import "./index.css";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import MainPage from "./MainPage";
// import NBAPage from "./NBAPage";
// import WNBAPage from "./WNBAPage";

// /*
// Notes:
// - Endpoint: http://127.0.0.1:8000/api/streaks/?games=...&limit=...
// - Backend should return hot/cold arrays with objects that include:
//   - player_id (optional but used to fetch headshot)
//   - name / player_name
//   - team
//   - fg_pct or agg_fg_pct or avg_fg_pct
//   - fg3_pct or agg_3p_pct or avg_3p_pct
// */

// function getPlayerImageUrl(playerId) {
//   if (!playerId) return null;
//   // common NBA CDN headshot pattern; try a mid-size image
//   // If this 404s for some players, the <img> onError will swap to fallback.
//   return `https://cdn.nba.com/headshots/nba/latest/260x190/${playerId}.png`;
// }

// function normalizePlayerObj(obj) {
//   // normalize different backend keys to consistent UI fields
//   const player_id = obj.player_id ?? obj.PERSON_ID ?? obj.id ?? null;
//   const name = obj.name ?? obj.player_name ?? obj.DISPLAY_FIRST_LAST ?? obj.player ?? "Unknown";
//   const team = obj.team ?? obj.TEAM_ABBREVIATION ?? obj.team_abbr ?? "";
//   // prefer aggregated pct then avg then generic `fg_pct`
//   const fg_pct = obj.agg_fg_pct ?? obj.avg_fg_pct ?? obj.fg_pct ?? obj.FG_PCT ?? 0;
//   const fg3_pct = obj.agg_3p_pct ?? obj.avg_3p_pct ?? obj.fg3_pct ?? obj.FG3_PCT ?? 0;
//   const games_sampled = obj.games_sampled ?? obj.sample_games ?? obj.games_sampled ?? null;

//   return { player_id, name, team, fg_pct, fg3_pct, games_sampled };
// }

// function StreakCard({ player, isHot }) {
//   const [imgError, setImgError] = useState(false);
//   const normalized = normalizePlayerObj(player);
//   const imgUrl = getPlayerImageUrl(normalized.player_id);

//   // Base color (dark card)
//   const baseBg = "#1e232b";

//   // Hot & Cold accent gradients
//   const hotGradient = "linear-gradient(145deg, rgba(255,100,0,0.3), rgba(255,180,80,0.1))";
//   const coldGradient = "linear-gradient(145deg, rgba(0,180,255,0.25), rgba(0,120,255,0.05))";

//   const boxShadowHot = "0 0 12px rgba(255,100,0,0.6)";
//   const boxShadowCold = "0 0 12px rgba(0,160,255,0.6)";

//   const cardStyle = {
//     display: "flex",
//     alignItems: "center",
//     gap: "1rem",
//     padding: "1rem",
//     borderRadius: 12,
//     background: `${isHot ? hotGradient : coldGradient}, ${baseBg}`,
//     color: "white",
//     border: `1px solid ${isHot ? "rgba(255,150,50,0.25)" : "rgba(100,160,255,0.25)"}`,
//     boxShadow: isHot ? boxShadowHot : boxShadowCold,
//     transition: "transform 0.2s ease, box-shadow 0.2s ease",
//   };

//   const nameStyle = { fontWeight: 700, marginBottom: 4, fontSize: "1.05rem" };
//   const teamStyle = { fontSize: 13, color: "#bbb", marginBottom: 6 };

//   return (
//     <div
//       style={cardStyle}
//       onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
//       onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
//     >
//       <div style={{ width: 72, height: 72, flex: "0 0 72px", position: "relative" }}>
//         {imgUrl && !imgError ? (
//           <img
//             src={imgUrl}
//             alt={normalized.name}
//             style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
//             onError={() => setImgError(true)}
//           />
//         ) : (
//           <div
//             style={{
//               width: "100%",
//               height: "100%",
//               borderRadius: 8,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               background: "#2a2f38",
//               color: "#888",
//               fontWeight: 700,
//             }}
//           >
//             {normalized.name ? normalized.name.split(" ").map((n) => n[0]).slice(0, 2).join("") : "?"}
//           </div>
//         )}
//       </div>

//       <div style={{ flex: 1 }}>
//         <div style={nameStyle}>
//           {normalized.name}{" "}
//           <span style={{ marginLeft: 6, fontSize: 16 }}>{isHot ? "🔥" : "❄️"}</span>
//         </div>
//         <div style={teamStyle}>{normalized.team}</div>

//         <div style={{ display: "flex", gap: "1rem", alignItems: "baseline" }}>
//           <div>
//             <div style={{ fontSize: 12, color: "#aaa" }}>FG%</div>
//             <div style={{ fontWeight: 700, fontSize: 16, color: isHot ? "#ffa366" : "#6dcaff" }}>
//               {normalized.fg_pct ?? "--"}
//             </div>
//           </div>
//           <div>
//             <div style={{ fontSize: 12, color: "#aaa" }}>3P%</div>
//             <div style={{ fontWeight: 700, fontSize: 16, color: isHot ? "#ffb977" : "#87d0ff" }}>
//               {normalized.fg3_pct ?? "--"}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function HomeContent() {
//   const [streaks, setStreaks] = useState({ hot: [], cold: [] });
//   const [loading, setLoading] = useState(true);
//   const [games, setGames] = useState(10);
//   const [limit, setLimit] = useState(20);
//   const [mode, setMode] = useState("both"); // "hot" | "cold" | "both"
//   const [error, setError] = useState(null);

//   const fetchStreaks = async (numGames, lim = 20) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await fetch(`http://127.0.0.1:8000/api/streaks?games=${numGames}&limit=${lim}`);
//       if (!res.ok) {
//         throw new Error(`HTTP ${res.status}`);
//       }
//       const data = await res.json();

//       // Backend response shape might vary. try multiple keys.
//       const hotCandidates =
//         data.hot_streaks ||
//         data.hot_by_fg_agg ||
//         data.hot_by_fg ||
//         data.hot_by_fg_agg ||
//         data.hot_by_fg ||
//         data.hot ||
//         [];

//       const coldCandidates =
//         data.cold_streaks ||
//         data.cold_by_fg_agg ||
//         data.cold_by_fg ||
//         data.cold ||
//         [];

//       // If the backend uses keys like hot_by_fg_agg, that will work. If backend returns
//       // hot_by_fg_agg items with agg_fg_pct etc, normalize in StreakCard.

//       // If the backend returns `hot_by_fg_agg` and it's empty but `raw_sample` exists, fall back.
//       let hot = hotCandidates;
//       let cold = coldCandidates;
//       if ((!hot || hot.length === 0) && data.raw_sample) hot = data.raw_sample;
//       if ((!cold || cold.length === 0) && data.raw_sample) cold = data.raw_sample;

//       // Ensure arrays
//       hot = Array.isArray(hot) ? hot : [];
//       cold = Array.isArray(cold) ? cold : [];

//       setStreaks({ hot, cold });
//     } catch (err) {
//       console.error("fetchStreaks error:", err);
//       setError(err.message || String(err));
//       setStreaks({ hot: [], cold: [] });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStreaks(games, limit);
//   }, [games, limit]);

//   const displayed = (() => {
//     if (mode === "hot") return streaks.hot;
//     if (mode === "cold") return streaks.cold;
//     // both: interleave hot then cold (or concat)
//     return [...streaks.hot, ...streaks.cold];
//   })();

//   return (
//     <div style={{ padding: "2rem" }}>
   

//       <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
//         <label>
//           Streak window:&nbsp;
//           <select value={games} onChange={(e) => setGames(Number(e.target.value))}>
//             <option value={10}>10 games</option>
//             <option value={15}>15 games</option>
//             <option value={20}>20 games</option>
//           </select>
//         </label>

//         <label>
//           Players limit:&nbsp;
//           <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
//             <option value={5}>5</option>
//             <option value={10}>10</option>
//             <option value={20}>20</option>
//             <option value={50}>50</option>
//           </select>
//         </label>

//         <div style={{ marginLeft: "auto" }}>
//           <button onClick={() => setMode("both")} style={{ marginRight: 8 }}>
//             Both
//           </button>
//           <button onClick={() => setMode("hot")} style={{ marginRight: 8 }}>
//             Hot
//           </button>
//           <button onClick={() => setMode("cold")}>Cold</button>
//         </div>
//       </div>

//       <h2 style={{ marginTop: 8 }}>
//         Showing {mode === "both" ? "Hot & Cold" : mode === "hot" ? "Hot" : "Cold"} streaks — window: {games} games
//       </h2>

//       {loading ? (
//         <p>Loading streaks…</p>
//       ) : error ? (
//         <div style={{ color: "crimson" }}>Error: {error}</div>
//       ) : displayed.length === 0 ? (
//         <p>No streak data found</p>
//       ) : (
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
//             gap: 16,
//             marginTop: 12,
//           }}
//         >
//           {displayed.map((p, idx) => {
//             // determine if this entry came from hot or cold list
//             const isFromHot = streaks.hot.findIndex((h) => {
//               // compare by player id or name
//               const hid = h.player_id ?? h.PERSON_ID ?? h.id;
//               const pid = p.player_id ?? p.PERSON_ID ?? p.id;
//               if (hid && pid) return String(hid) === String(pid);
//               // fallback: compare name
//               return (h.player_name ?? h.name ?? h.DISPLAY_FIRST_LAST ?? "").toLowerCase() ===
//                      (p.player_name ?? p.name ?? p.DISPLAY_FIRST_LAST ?? "").toLowerCase();
//             }) >= 0;

//             return <StreakCard key={idx} player={p} isHot={isFromHot} />;
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(
//   <React.StrictMode>
//     <Router>
//       <Routes>
//         <Route path="/" element={<MainPage />}>
//           <Route index element={<HomeContent />} />
//           <Route path="nba/*" element={<NBAPage />} />
//           <Route path="wnba/*" element={<WNBAPage />} />
//         </Route>
//       </Routes>
//     </Router>
//   </React.StrictMode>
// );
// index.js
// index.js
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./MainPage";
import NBAPage from "./NBAPage";
import WNBAPage from "./WNBAPage";

function getPlayerImageUrl(playerId) {
  if (!playerId) return null;
  return `https://cdn.nba.com/headshots/nba/latest/260x190/${playerId}.png`;
}

function normalizePlayerObj(obj) {
  const player_id = obj.player_id ?? obj.PERSON_ID ?? obj.id ?? null;
  const name = obj.name ?? obj.player_name ?? obj.DISPLAY_FIRST_LAST ?? obj.player ?? "Unknown";
  const team = obj.team ?? obj.TEAM_ABBREVIATION ?? obj.team_abbr ?? "";
  const fg_pct = obj.fg_pct ?? obj.agg_fg_pct ?? obj.avg_fg_pct ?? obj.FG_PCT ?? 0;
  const fg3_pct = obj.fg3_pct ?? obj.agg_3p_pct ?? obj.avg_3p_pct ?? obj.FG3_PCT ?? 0;
  const games_played = obj.games_played ?? obj.games_sampled ?? obj.sample_games ?? null;

  return { player_id, name, team, fg_pct, fg3_pct, games_played };
}

function StreakCard({ player, isHot }) {
  const [imgError, setImgError] = useState(false);
  const normalized = normalizePlayerObj(player);
  const imgUrl = getPlayerImageUrl(normalized.player_id);

  const baseBg = "#1e232b";
  const hotGradient = "linear-gradient(145deg, rgba(255,100,0,0.3), rgba(255,180,80,0.1))";
  const coldGradient = "linear-gradient(145deg, rgba(0,180,255,0.25), rgba(0,120,255,0.05))";
  const boxShadowHot = "0 0 12px rgba(255,100,0,0.6)";
  const boxShadowCold = "0 0 12px rgba(0,160,255,0.6)";

  const cardStyle = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem",
    borderRadius: 12,
    background: `${isHot ? hotGradient : coldGradient}, ${baseBg}`,
    color: "white",
    border: `1px solid ${isHot ? "rgba(255,150,50,0.25)" : "rgba(100,160,255,0.25)"}`,
    boxShadow: isHot ? boxShadowHot : boxShadowCold,
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  };

  const nameStyle = { fontWeight: 700, marginBottom: 4, fontSize: "1.05rem" };
  const teamStyle = { fontSize: 13, color: "#bbb", marginBottom: 6 };

  return (
    <div
      style={cardStyle}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
    >
      <div style={{ width: 72, height: 72, flex: "0 0 72px", position: "relative" }}>
        {imgUrl && !imgError ? (
          <img
            src={imgUrl}
            alt={normalized.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#2a2f38",
              color: "#888",
              fontWeight: 700,
            }}
          >
            {normalized.name ? normalized.name.split(" ").map((n) => n[0]).slice(0, 2).join("") : "?"}
          </div>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <div style={nameStyle}>
          {normalized.name}{" "}
          <span style={{ marginLeft: 6, fontSize: 16 }}>{isHot ? "🔥" : "❄️"}</span>
        </div>
        <div style={teamStyle}>{normalized.team}</div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "baseline" }}>
          <div>
            <div style={{ fontSize: 12, color: "#aaa" }}>FG%</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: isHot ? "#ffa366" : "#6dcaff" }}>
              {normalized.fg_pct}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#aaa" }}>3P%</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: isHot ? "#ffb977" : "#87d0ff" }}>
              {normalized.fg3_pct}%
            </div>
          </div>
          {normalized.games_played && (
            <div>
              <div style={{ fontSize: 12, color: "#aaa" }}>Games</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#999" }}>
                {normalized.games_played}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HomeContent() {
  const [streaks, setStreaks] = useState({ hot: [], cold: [] });
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState(10);
  const [limit, setLimit] = useState(5);
  const [mode, setMode] = useState("both");
  const [statType, setStatType] = useState("fg"); // "fg" or "3p"
  const [error, setError] = useState(null);

  const fetchStreaks = async (numGames, lim = 20) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/streaks?games=${numGames}&limit=${lim}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      
      console.log("API Response:", data); // Debug log

      // ✅ Match the updated backend response structure
      const hot_fg = data.hot_fg_streaks || [];
      const cold_fg = data.cold_fg_streaks || [];
      const hot_3p = data.hot_3p_streaks || [];
      const cold_3p = data.cold_3p_streaks || [];

      setStreaks({ 
        hot_fg, 
        cold_fg, 
        hot_3p, 
        cold_3p 
      });
    } catch (err) {
      console.error("fetchStreaks error:", err);
      setError(err.message || String(err));
      setStreaks({ hot_fg: [], cold_fg: [], hot_3p: [], cold_3p: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreaks(games, limit);
  }, [games, limit]);

  const displayed = (() => {
    const hotKey = statType === "fg" ? "hot_fg" : "hot_3p";
    const coldKey = statType === "fg" ? "cold_fg" : "cold_3p";
    
    if (mode === "hot") {
      return (streaks[hotKey] || []).map(p => ({ ...p, _isHot: true, _statType: statType }));
    }
    if (mode === "cold") {
      return (streaks[coldKey] || []).map(p => ({ ...p, _isHot: false, _statType: statType }));
    }
    // Both mode: concat hot then cold, marking each
    return [
      ...(streaks[hotKey] || []).map(p => ({ ...p, _isHot: true, _statType: statType })),
      ...(streaks[coldKey] || []).map(p => ({ ...p, _isHot: false, _statType: statType }))
    ];
  })();

  const pageStyle = {
    padding: "2rem",
    maxWidth: "1400px",
    margin: "0 auto",
   
  };

  const controlsStyle = {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
  };

  const selectStyle = {
    padding: "0.5rem",
    borderRadius: 6,
    border: "1px solid #444",
    background: "#2a2f38",
    color: "white",
    fontSize: "0.95rem",
  };

  const buttonStyle = {
    padding: "0.5rem 1rem",
    borderRadius: 6,
    border: "none",
    background: "#3a4150",
    color: "white",
    cursor: "pointer",
    transition: "all 0.2s",
    fontSize: "0.9rem",
    fontWeight: 500,
  };

  const activeButtonStyle = {
    ...buttonStyle,
    background: "#4a90e2",
  };

  return (
    <div style={pageStyle}>
      <h1 style={{ marginBottom: "1.5rem", fontSize: "2rem" }}>
        NBA Hot & Cold Streaks 🏀
      </h1>

      <div style={controlsStyle}>
        <label>
          <span style={{ marginRight: 8 }}>Streak window:</span>
          <select 
            value={games} 
            onChange={(e) => setGames(Number(e.target.value))}
            style={selectStyle}
          >
            <option value={10}>10 games</option>
            <option value={15}>15 games</option>
            <option value={20}>20 games</option>
          </select>
        </label>

        <label>
          <span style={{ marginRight: 8 }}>Players limit:</span>
          <select 
            value={limit} 
            onChange={(e) => setLimit(Number(e.target.value))}
            style={selectStyle}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={0}>All Players</option>
          </select>
        </label>

        <label>
          <span style={{ marginRight: 8 }}>Stat type:</span>
          <select 
            value={statType} 
            onChange={(e) => setStatType(e.target.value)}
            style={selectStyle}
          >
            <option value="fg">Field Goal %</option>
            <option value="3p">3-Point %</option>
          </select>
        </label>

        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
          <button 
            onClick={() => setMode("both")} 
            style={mode === "both" ? activeButtonStyle : buttonStyle}
          >
            Both
          </button>
          <button 
            onClick={() => setMode("hot")} 
            style={mode === "hot" ? activeButtonStyle : buttonStyle}
          >
            🔥 Hot
          </button>
          <button 
            onClick={() => setMode("cold")}
            style={mode === "cold" ? activeButtonStyle : buttonStyle}
          >
            ❄️ Cold
          </button>
        </div>
      </div>

      <h2 style={{ marginTop: 8, fontSize: "1.3rem", color: "#ccc" }}>
        Showing {mode === "both" ? "Hot & Cold" : mode === "hot" ? "Hot 🔥" : "Cold ❄️"} streaks
        {" — "}
        {statType === "fg" ? "Field Goal" : "3-Point"} % over {games} games
      </h2>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🏀</div>
          <p>Loading streaks…</p>
        </div>
      ) : error ? (
        <div style={{ 
          color: "crimson", 
          background: "rgba(220,20,60,0.1)", 
          padding: "1rem", 
          borderRadius: 8,
          border: "1px solid rgba(220,20,60,0.3)"
        }}>
          <strong>Error:</strong> {error}
          <br />
          <small style={{ color: "#999" }}>
            Make sure your FastAPI backend is running on http://127.0.0.1:8000
          </small>
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
          <p>No streak data found</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 16,
            marginTop: 20,
          }}
        >
          {displayed.map((p, idx) => {
            // ✅ Use the marked hot/cold status directly from the player object
            const isFromHot = p._isHot ?? false;

            return <StreakCard key={idx} player={p} isHot={isFromHot} />;
          })}
        </div>
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