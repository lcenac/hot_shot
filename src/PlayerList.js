// import { useState } from "react";
// import { Link } from "react-router-dom";
// import "./PlayerList.css";

// export default function PlayerList() {
//   const players = [
//     { id: 237, first_name: "LeBron", last_name: "James", league: "NBA", avg_points:"25.3", avg_reb:"6.2",avg_ass:"3.2", fg:"54" },
//     { id: 115, first_name: "Stephen", last_name: "Curry", league: "NBA" },
//     { id: 192, first_name: "A'ja", last_name: "Wilson", league: "WNBA" },
//     { id: 301, first_name: "Luka", last_name: "Doncic", league: "NBA" },
//     { id: 402, first_name: "Breanna", last_name: "Stewart", league: "WNBA" },
//   ];

//   const [searchTerm, setSearchTerm] = useState("");

//   // Filter players based on input
//   const filteredPlayers = players.filter((p) =>
//     `${p.first_name} ${p.last_name}`
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="container mt-4">
//       <h1 className="mb-4">Players</h1>

//       <form
//         className="d-flex mb-4"
//         role="search"
//         onSubmit={(e) => e.preventDefault()} // stop page reload
//       >
//         <input
//           className="form-control me-2"
//           type="search"
//           placeholder="Search"
//           aria-label="Search"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <button className="btn btn-outline-success" type="submit">
//           Search
//         </button>
//       </form>

//       <div className="row">
//         {filteredPlayers.map((p, index) => (
//           <div key={`${p.id}-${index}`} className="col-md-4 mb-3">
//             <div className="card shadow-sm h-100">
//               <div className="card-body d-flex flex-column">
//                 <h5 className="card-title">
//                   {p.first_name} {p.last_name}{" "}
//                   <span className="badge rounded-pill bg-primary">
//                     {p.league}
//                   </span>
//                 </h5>
                
//                 <p className="card-text text-muted">Click for more details</p>
//                 <Link
//                   to={`/player/${p.id}`}
//                   state={{
//                     name: `${p.first_name} ${p.last_name}`,
//                     league: p.league,
//                     avg_points: p.avg_points,
//                     avg_reb: p.avg_reb,
//                      avg_ass: p.avg_ass,
//                       fg: p.fg,
//                   }}
//                   className="btn btn-primary mt-auto"
//                 >
//                   View Stats
//                 </Link>
//               </div>
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
          {
            headers: {
              accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch players");
        }

        const data = await response.json();
        console.log(data); // optional: check the API response in console
        console.log("Full API response:", data);
console.log("First element:", Array.isArray(data) ? data[0] : data.players[0]);

        // Map API data to the structure we need
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
  
  // Filter players based on search input
  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Players</h1>

      <form
        className="d-flex mb-4"
        role="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          className="form-control me-2"
          type="search"
          placeholder="Search"
          aria-label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-outline-success" type="submit">
          Search
        </button>
      </form>

      <div className="row">
        {filteredPlayers.map((p) => (
          <div key={p.id} className="col-md-4 mb-3">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">
                  {p.name}{" "}
                  <span className="badge rounded-pill bg-primary">
                    {p.team}
                  </span>
                </h5>
                <p className="card-text text-muted">Click for more details</p>
                <Link
                  to={`/player/${p.id}`}
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
