// WSchedule.js
import { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function WSchedule() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/schedule");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setGames(data.games || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSchedule();
  }, []);

  if (loading) return <p className="text-center mt-4">Loading today's games...</p>;
  if (error) return <p className="text-center mt-4 text-danger">Error fetching schedule: {error}</p>;
  if (games.length === 0) return <p className="text-center mt-4">No games scheduled for today.</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">WNBA Games Today</h2>
      <div className="row">
        {games.map((game) => (
          <div className="col-md-6 mb-3" key={game.id}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">
                  {game.away?.name || "TBD"} @ {game.home?.name || "TBD"}
                </h5>
                <p className="card-text mb-1">
                  <strong>Time:</strong> {new Date(game.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                {game.venue && <p className="card-text"><strong>Venue:</strong> {game.venue.name}</p>}
                {game.status && <p className="card-text"><strong>Status:</strong> {game.status}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
