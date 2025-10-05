// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useLocation } from "react-router-dom";
// import './PlayerDetail.css';


// function PlayerDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { state } = useLocation(); 
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await fetch(`http://localhost:8000/api/NBAplayer/${id}`);
//         if (!res.ok) throw new Error(`Error: ${res.status}`);
//         const data = await res.json();
//         if (!data.success) throw new Error(data.error || "No stats found");
//         setStats(data.stats);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStats();
//   }, [id]);

//   if (loading) return  <div class="spinner-border text-primary"   role="status">

//   <span class="visually-hidden">Loading...</span>
// </div>
//   if (error) return <p style={{ color: "red" }}>{error}</p>;

//   // Format FG% nicely
//   const fgPercent = stats ? (stats.FG_PCT * 100).toFixed(1) : 0;

  

//   return (
//     <div className="container mt-4">
//       <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
//         &larr; Back to List
//       </button>
//       <h2 className="mb-3"> {state?.playerName || "Player"}</h2>
//       {stats && (
//         <>
//           <h5>Season: {stats.season}</h5>
//           <h6>Team: {stats.team}</h6>

//           <div className="row mt-3">
//             {[
//               { label: "Points", value: stats.PTS },
//               { label: "Rebounds", value: stats.REB },
//               { label: "Assists", value: stats.AST },
//               { label: "FG%", value: fgPercent },
//             ].map((stat, i) => (
//               <div key={i} className="col-md-3 mb-3">
//                 <div className="card shadow-sm text-center p-3">
//                   <h6>{stat.label}</h6>
//                   <p className="fs-4">{stat.value}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// export default PlayerDetail;


import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import './PlayerDetail.css';

function PlayerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation(); 
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/NBAplayer/${id}`);
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "No stats found");
        setStats(data.stats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [id]);

  if (loading) return (
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  );
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const fgPercent = stats ? (stats.FG_PCT * 100).toFixed(1) : 0;
  const headshotUrl = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${id}.png`;

  return (
    <div className="mb-3 text-start">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        &larr; Back to List
      </button><br/><br/>

      {/* Player Info Section */}
      <div className="player-info d-flex align-items-center mb-4 flex-wrap">
        <div className="player-photo me-4 mb-3">
          <img 
            src={headshotUrl} 
            alt={`${state?.playerName || "Player"} Headshot`} 
            className="img-fluid rounded shadow-sm"
            onError={(e) => e.target.src = "/images/placeholder.png"}
          />
        </div>
        <div className="player-details">
          <h2 className="mb-2">{state?.playerName || "Player"}</h2>
          {stats && (
            <>
              <h5 className="mb-1">Season: {stats.season}</h5>
              <h6 className="text-muted">Team: {stats.team}</h6>
            </>
          )}
        </div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="row mt-3">
          {[
            { label: "Points", value: stats.PTS },
            { label: "Rebounds", value: stats.REB },
            { label: "Assists", value: stats.AST },
            { label: "FG%", value: fgPercent },
          ].map((stat, i) => (
            <div key={i} className="col-md-3 mb-3">
              <div className="card shadow-sm text-center p-3">
                <h6>{stat.label}</h6>
                <p className="fs-4">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlayerDetail;
