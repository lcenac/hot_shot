// WPlayerDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";



function WPlayerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/player/${id}`);
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

  if (loading) return <p>Loading player stats...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // Format FG% nicely
  const fgPercent = stats ? (stats.FG_PCT * 100).toFixed(1) : 0;

  return (
    <div className="container mt-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        &larr; Back to List
      </button>
      <h2 className="mb-3">WNBA Player Stats</h2>
      {stats && (
        <>
          <h5>Season: {stats.season}</h5>
          <h6>Team: {stats.team}</h6>

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
        </>
      )}
    </div>
  );
}

export default WPlayerDetail;
