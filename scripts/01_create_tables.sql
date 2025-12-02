-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  alert_id VARCHAR(255) UNIQUE NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  alert_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
  source VARCHAR(255),
  destination VARCHAR(255),
  message TEXT NOT NULL,
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create alert groups table
CREATE TABLE IF NOT EXISTS alert_groups (
  id SERIAL PRIMARY KEY,
  group_id VARCHAR(255) UNIQUE NOT NULL,
  group_name VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
  alert_count INT DEFAULT 0,
  confidence_score FLOAT DEFAULT 0,
  threat_category VARCHAR(100),
  first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'investigating')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create alert_group_members junction table
CREATE TABLE IF NOT EXISTS alert_group_members (
  id SERIAL PRIMARY KEY,
  group_id INT NOT NULL REFERENCES alert_groups(id) ON DELETE CASCADE,
  alert_id INT NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  similarity_score FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, alert_id)
);

-- Create sessions table for processed batches
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  total_alerts INT NOT NULL,
  grouped_alerts INT DEFAULT 0,
  noise_reduced INT DEFAULT 0,
  processing_time_ms INT,
  status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create alert_deduplication table
CREATE TABLE IF NOT EXISTS alert_deduplication (
  id SERIAL PRIMARY KEY,
  original_alert_id INT NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  duplicate_of_id INT NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  similarity_score FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alert_groups_status ON alert_groups(status);
CREATE INDEX IF NOT EXISTS idx_alert_groups_severity ON alert_groups(severity);
CREATE INDEX IF NOT EXISTS idx_alert_group_members_group_id ON alert_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_alert_group_members_alert_id ON alert_group_members(alert_id);
