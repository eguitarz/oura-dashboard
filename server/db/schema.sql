-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    oura_user_id VARCHAR(255) UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sleep_data table
CREATE TABLE sleep_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    summary_date DATE NOT NULL,
    sleep_score INTEGER,
    total_sleep_duration INTEGER,
    deep_sleep_duration INTEGER,
    rem_sleep_duration INTEGER,
    light_sleep_duration INTEGER,
    time_in_bed INTEGER,
    efficiency INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create readiness_data table
CREATE TABLE readiness_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    summary_date DATE NOT NULL,
    readiness_score INTEGER,
    hrv_balance INTEGER,
    temperature_deviation DECIMAL,
    previous_night_score INTEGER,
    sleep_balance INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activity_data table
CREATE TABLE activity_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    summary_date DATE NOT NULL,
    activity_score INTEGER,
    daily_movement INTEGER,
    steps INTEGER,
    calories_active INTEGER,
    target_calories INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indices for better query performance
CREATE INDEX idx_sleep_data_user_date ON sleep_data(user_id, summary_date);
CREATE INDEX idx_readiness_data_user_date ON readiness_data(user_id, summary_date);
CREATE INDEX idx_activity_data_user_date ON activity_data(user_id, summary_date); 