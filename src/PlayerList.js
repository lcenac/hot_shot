import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./PlayerList.css";

export default function PlayerList() {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(
          "http://rest.nbaapi.com/api/PlayerDataTotals/season/2025",
          { headers: { accept: "application/json" } }
        );

        if (!response.ok) throw new Error("Failed to fetch players");

        const data = await response.json();

        const playerList = data.map((p) => ({
          id: p.id,
          name: p.playerName,
          team: p.team,
          avg_points:
            p.games && p.points ? (Number(p.points) / Number(p.games)).toFixed(1) : "N/A",
          avg_reb:
            p.games && p.totalRb ? (Number(p.totalRb) / Number(p.games)).toFixed(1) : "N/A",
          avg_ass:
            p.games && p.assists ? (Number(p.assists) / Number(p.games)).toFixed(1) : "N/A",
          fg: p.fieldPercent ? (Number(p.fieldPercent) * 100).toFixed(1) + "%" : "N/A",
        }));

        setPlayers(playerList);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPlayers();
  }, []);

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Players</h1>

      <form
        className="d-flex mb-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          className="form-control me-2"
          type="search"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-outline-success" type="submit">Search</button>
      </form>

      <div className="row">
        {filteredPlayers.map((p) => (
          <div key={p.id} className="col-md-4 mb-3">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">
                  {p.name} <span className="badge rounded-pill bg-primary">{p.team}</span>
                </h5>
                <p className="card-text text-muted">Click for more details</p>
                <Link
                  to={`player/${p.id}`} // relative path
                  state={{
                    name: p.name,
                    team: p.team,
                    avg_points: p.avg_points,
                    avg_reb: p.avg_reb,
                    avg_ass: p.avg_ass,
                    fg: p.fg,
                  }}
                  className="btn btn-primary mt-auto"
                >
                  View Stats
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <p className="text-muted">No players found.</p>
      )}
    </div>
  );
}

// // PlayerList.js
// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './PlayerList.css';

// export default function PlayerList() {
//   const [players, setPlayers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     async function fetchPlayers() {
//       try {
//         const response = await fetch("http://127.0.0.1:8000/api/nbaplayers/");
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
// console.log("API data sample:", data[0]);
//         // AFTER
// const mappedPlayers = data.map(p => ({
//   id: p.PERSON_ID,
  
//   name: p.DISPLAY_FIRST_LAST,
//   team: p.TEAM_ABBREVIATION,
//   avg_points: p.AVG_POINTS || "N/A",
//   avg_reb: p.AVG_TOT_REB || "N/A",
//   avg_ass: p.AST || "N/A",
//   fg: p.FG || "N/A",
// }));


// // console.log(mappedPlayers);
// setPlayers(mappedPlayers);

//         setPlayers(mappedPlayers);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchPlayers();
//   }, []);


  

//   const filteredPlayers = players.filter(p =>
//     p.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

 


//   if (loading) return<div class="spinner-border text-primary" role="status">

//   <span class="visually-hidden">Loading...</span>
// </div>
//   if (error) return <p className="text-center mt-4 text-danger">Error: {error}</p>;

//   return (
//     <div className="container mt-4">
//       <h1 className="mb-4">Players</h1>
    
//       <form className="d-flex mb-4" onSubmit={(e) => e.preventDefault()}>
//         <input
//           className="form-control me-2"
//           type="search"
//           placeholder="Search"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <button className="btn btn-outline-success" type="submit">Search</button>
//       </form>
    
//       <div className="row">
//         {filteredPlayers.map((p) => (
//           <div key={p.id} className="col-md-4 mb-3">
//             <div className="card shadow-sm h-100">
//               <div className="card-body d-flex flex-column">
//   <h5 className="card-title">
//     {p.name} <span className="badge rounded-pill bg-primary">{p.team}</span>
//   </h5>
//   <p className="card-text text-muted">Click for more details</p>
  

//   <Link to={`/nba/player/${p.id}`} state={{ playerName: p.name }} className="btn btn-primary mt-auto">
//     See Stats
//   </Link>
  
// </div>


//             </div>
//           </div>
//         ))}
//       </div>

//       {filteredPlayers.length === 0 && (
//         <p className="text-muted">No players found.</p>
//       )}
//     </div>
//   );
// }