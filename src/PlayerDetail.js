import { useParams, useLocation } from "react-router-dom";
import './PlayerDetail.css';
export default function PlayerDetail() {
  const { id } = useParams();
  const location = useLocation();

  const playerName = location.state?.name || "";
  const league = location.state?.league || "";
  const avg_points = location.state?.avg_points || "N/A";
  const avg_reb = location.state?.avg_reb || "N/A";
  const avg_ass = location.state?.avg_ass || "N/A";
  const fg = location.state?.fg || "N/A";

  return (
    <div className="container mt-4">
      <h2>{playerName ? playerName : `Player ID: ${id}`}</h2>
     

      <div className="row mt-3">
        <div className="col-md-3 mb-3">
          <div className="card shadow text-center p-3">
            <h6>Points</h6>
            <p className="fs-4">{avg_points}</p>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm text-center p-3">
            <h6>Rebounds</h6>
            <p className="fs-4">{avg_reb}</p>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm text-center p-3">
            <h6>Assists</h6>
            <p className="fs-4">{avg_ass}</p>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm text-center p-3">
            <h6>FG%</h6>
            <p className="fs-4">{fg}</p>
          </div>
        </div>
      </div>
    </div>







  );
}
