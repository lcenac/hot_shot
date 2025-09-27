import { useParams, useLocation } from "react-router-dom";
import './PlayerDetail.css';
export default function PlayerDetail() {
  const { id } = useParams();
  const location = useLocation();

  const playerName = location.state?.name || `Player ID: ${id}`;
  const team = location.state?.team || "N/A";
  const avg_points = location.state?.avg_points || "N/A";
  const avg_reb = location.state?.avg_reb || "N/A";
  const avg_ass = location.state?.avg_ass || "N/A";
  const fg = location.state?.fg || "N/A";

  return (
    <div className="container mt-4">
      <h2>{playerName} <span className="text-muted">({team})</span></h2>

      <div className="row mt-3">
        {[
          { label: "Points", value: avg_points },
          { label: "Rebounds", value: avg_reb },
          { label: "Assists", value: avg_ass },
          { label: "FG%", value: fg },
        ].map((stat, i) => (
          <div key={i} className="col-md-3 mb-3">
            <div className="card shadow-sm text-center p-3">
              <h6>{stat.label}</h6>
              <p className="fs-4">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
