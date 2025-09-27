import express from "express";
import axios from "axios";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const app = express();
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const API_KEY = process.env.API_FOOTBALL_KEY;

// Example endpoint to get player info
app.get("/api/player/:name", async (req, res) => {
  const { name } = req.params;

  try {
    // Fetch image from API-Football
    const response = await axios.get(
      `https://v3.football.api-sports.io/players?search=${encodeURIComponent(name)}`,
      {
        headers: { "x-apisports-key": API_KEY },
      }
    );

    const playerData = response.data.response[0]?.player || {};
    const photoUrl = playerData.photo || null;

    // Optional: fetch stats from your DB
    const statsResult = await pool.query(
      "SELECT * FROM player_stats WHERE player_id = (SELECT id FROM players WHERE name = $1)",
      [name]
    );

    res.json({ name, photo: photoUrl, stats: statsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch player info" });
  }
});

app.listen(5000, () => console.log("Backend running on port 5000"));
