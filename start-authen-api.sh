#!/bin/bash

# Set variables
REPO_URL="git@github.com:grit8CT/lexi2-authen.git"
LOCAL_DIR="$(pwd)/lexi2-authen"
BUILD_OUTPUT="$LOCAL_DIR/LexiAuthenAPI.Api/bin/Debug/net8.0"
MIGRATIONS_DIR="$LOCAL_DIR/LexiAuthenAPI.Infrastructure/Migrations"
DB_NAME="LexiAuthenDB"
DB_SERVER="localhost"
DB_USER="sa"
DB_PASSWORD="YourNewStrong!Password"

# Step 1: Clone the repository
if [ -d "$LOCAL_DIR" ]; then
    echo "Repository already exists at $LOCAL_DIR. Pulling latest changes..."
    cd "$LOCAL_DIR" || exit
    git pull
else
    echo "Cloning repository from $REPO_URL to $LOCAL_DIR..."
    git clone "$REPO_URL" "$LOCAL_DIR"
fi

# Step 2: Drop the database if it exists
echo "Dropping the database $DB_NAME if it exists..."
sqlcmd -S $DB_SERVER -U $DB_USER -P "$DB_PASSWORD" -Q "IF DB_ID('$DB_NAME') IS NOT NULL DROP DATABASE [$DB_NAME];"
if [ $? -ne 0 ]; then
    echo "Failed to drop the database. Please check the connection details. Exiting."
    exit 1
fi
echo "Database $DB_NAME dropped successfully."

# Step 3: Set up the database using EF Core
echo "Setting up the database using EF Core..."
cd "$LOCAL_DIR/LexiAuthenAPI.Infrastructure" || exit

# Delete the existing Migrations directory
if [ -d "$MIGRATIONS_DIR" ]; then
    echo "Deleting existing migrations directory..."
    rm -rf "$MIGRATIONS_DIR"
    echo "Migrations directory deleted."
fi

# Add a new migration
dotnet ef migrations add InitialCreate
if [ $? -ne 0 ]; then
    echo "Migration creation failed. Proceeding with existing migrations (if any)..."
fi

# Apply migrations
dotnet ef database update --connection "Server=$DB_SERVER;Database=$DB_NAME;User Id=$DB_USER;Password=$DB_PASSWORD;TrustServerCertificate=True;"
if [ $? -ne 0 ]; then
    echo "Database setup failed. Exiting."
    exit 1
fi
echo "Database setup completed successfully."

# Step 4: Build the solution in Debug mode
echo "Building the solution in Debug mode..."
cd "$LOCAL_DIR/LexiAuthenAPI.Api" || exit
dotnet build LexiAuthenAPI.Api.sln -c Debug
if [ $? -ne 0 ]; then
    echo "Build failed. Exiting."
    exit 1
fi

# Step 5: Set environment variable for URLs
export ASPNETCORE_URLS="https://localhost:5001;http://localhost:5108"

# Step 6: Run the application in Debug mode
echo "Starting the application in Debug mode..."
export ASPNETCORE_ENVIRONMENT="Development"
dotnet "$BUILD_OUTPUT/LexiAuthenAPI.Api.dll"
if [ $? -ne 0 ]; then
    echo "Application failed to start. Exiting."
    exit 1
fi

# Step 7: Success message
echo "Application running in Debug mode."
