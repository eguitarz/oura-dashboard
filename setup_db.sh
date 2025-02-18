#!/bin/bash

# Create database
PGUSER=postgres psql -c "DROP DATABASE IF EXISTS oura_dashboard;"
PGUSER=postgres psql -c "CREATE DATABASE oura_dashboard;"

# Run schema
PGUSER=postgres psql -d oura_dashboard -f server/db/schema.sql

echo "Database setup completed!" 