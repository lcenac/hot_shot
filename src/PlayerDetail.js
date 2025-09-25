import { useParams, useLocation } from "react-router-dom";

export default function PlayerDetail() {
  const { id } = useParams();
  const location = useLocation();
  const playerName = location.state?.name; // name passed from Link
  const league = location.state?.league

  return (
    <div>
      <h2>{playerName ? playerName : `Player ID: ${id}`}</h2>
      {/* Show stats, streak charts, etc. */}
    </div>
  );
}