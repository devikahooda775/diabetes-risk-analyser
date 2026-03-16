import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import fetch from "node-fetch"; // make sure node-fetch is installed

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// MySQL connection
const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "070705",
  database: "diabetesdb",
});

console.log("✅ Connected to MySQL database.");

// Save patient route
app.post("/api/patients", async (req, res) => {
  const { name, age, glucose, bloodPressure, bmi, insulin } = req.body;
  try {
    const [result] = await db.execute(
      "INSERT INTO patients (name, age, glucose, bloodPressure, bmi, insulin) VALUES (?, ?, ?, ?, ?, ?)",
      [name, age, glucose, bloodPressure, bmi, insulin]
    );
    res.status(201).json({ message: "Patient saved!", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Fetch patient info for dashboard
app.get("/api/patient/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.execute("SELECT * FROM patients WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Patient not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// OpenRouter chatbot route
app.post("/api/chatbot", async (req, res) => {
  const { userId } = req.body;

  try {
    // Get patient data from DB
    const [rows] = await db.execute("SELECT * FROM patients WHERE id = ?", [userId]);
    if (rows.length === 0) return res.status(404).json({ error: "Patient not found" });
    const user = rows[0];

    // Construct prompt for OpenRouter
    const prompt = `You are a diabetes health assistant. 
    Patient data: name=${user.name}, glucose=${user.glucose}, bloodPressure=${user.bloodPressure}, bmi=${user.bmi}, insulin=${user.insulin}. 
    Give advice based on this patient's data.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenRouter error: ${text}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;
    res.json({ reply });

  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ error: "Chatbot failed" });
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
