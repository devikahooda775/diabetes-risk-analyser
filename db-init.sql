CREATE DATABASE IF NOT EXISTS dosage_predictor;
USE dosage_predictor;

CREATE TABLE IF NOT EXISTS logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId VARCHAR(100) NOT NULL,
  bg FLOAT NOT NULL,            -- blood glucose (mg/dL) or chosen unit
  carbs FLOAT DEFAULT 0,        -- carbs consumed (grams)
  activity FLOAT DEFAULT 0,     -- activity score (0-10) or minutes
  dose FLOAT DEFAULT NULL,      -- insulin/medication dose actually given (label)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Optional: create index for faster per-user queries
CREATE INDEX idx_user ON logs(userId);
