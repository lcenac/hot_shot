import { useState } from "react";
import { Link } from "react-router-dom";
import "./PlayerList.css";

export default function PlayerList() {
  const players = [
    { id: 237, first_name: "LeBron", last_name: "James", league: "NBA", avg_points:"25.3", avg_reb:"6.2",avg_ass:"3.2", fg:"54" },
    { id: 115, first_name: "Stephen", last_name: "Curry", league: "NBA" },
    { id: 192, first_name: "A’ja", last_name: "Wilson", league: "WNBA" },
    { id: 301, first_name: "Luka", last_name: "Doncic", league: "NBA" },
    { id: 402, first_name: "Breanna", last_name: "Stewart", league: "WNBA" },
  ];

  const [searchTerm, setSearchTerm] = useState("");

  // Filter players based on input
  const filteredPlayers = players.filter((p) =>
    `${p.first_name} ${p.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Players</h1>

      <form
        className="d-flex mb-4"
        role="search"
        onSubmit={(e) => e.preventDefault()} // stop page reload
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
        {filteredPlayers.map((p, index) => (
          <div key={`${p.id}-${index}`} className="col-md-4 mb-3">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">
                  {p.first_name} {p.last_name}{" "}
                  <span className="badge rounded-pill bg-primary">
                    {p.league}
                  </span>
                </h5>
                <p className="card-text text-muted">Click for more details</p>
                <Link
                  to={`/player/${p.id}`}
                  state={{
                    name: `${p.first_name} ${p.last_name}`,
                    league: p.league,
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
