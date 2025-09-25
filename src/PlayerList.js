import { Link } from "react-router-dom";
import './PlayerList.css';
export default function PlayerList() {
  const players = [
    { id: 237, first_name: "LeBron", last_name: "James",league:"NBA" },
    { id: 115, first_name: "Stephen", last_name: "Curry", league:"NBA" },
    { id: 192, first_name: "A’ja", last_name: "Wilson",league:"WNBA" },
     { id: 237, first_name: "LeBron", last_name: "James",league:"NBA" },
    { id: 115, first_name: "Stephen", last_name: "Curry", league:"NBA"},
    { id: 192, first_name: "A’ja", last_name: "Wilson", league:"WNBA" },
  ];

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Players</h1>
      <div className="row">
        {players.map((p) => (
          <div key={p.id} className="col-md-4 mb-3">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">
                  {p.first_name} {p.last_name}<h6><span class="badge text-bg-secondary">{p.league}</span></h6>

                </h5>
                <p className="card-text text-muted">Click for more details</p>
                <Link 
                  to={`/player/${p.id}`} 
                  className="btn btn-primary mt-auto"
                >
                  View Stats
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
