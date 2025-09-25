import { useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function PlayerDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [playerName, setPlayerName] = useState(location.state?.name || "");
  const [league, setLeague] = useState(location.state?.league || "");
  const [avg_points, setPoints] = useState(location.state?.avg_points || "");
  const [avg_reb, setRebs] = useState(location.state?.avg_reb || "");

  return (
    <div className="container mt-4">
      <h2>
        {playerName ? playerName : `Player ID: ${id}`}{" "}
       
      </h2>
    <p>{ `Points: ${avg_points}`}{" "}</p>  
    </div>
  );
}
