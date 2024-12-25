@echo off

REM Set variables
set REPO_URL=git@github.com:grit8CT/lexi2-authen.git
set LOCAL_DIR=%cd%\lexi2-authen
set BUILD_OUTPUT=%LOCAL_DIR%\LexiAuthenAPI.Api\bin\Debug\net8.0
set MIGRATIONS_DIR=%LOCAL_DIR%\LexiAuthenAPI.Infrastructure\Migrations
set DB_NAME=LexiAuthenDB
set DB_CONNECTION_STRING="Server=localhost;Database=master;User Id=sa;Password=YourNewStrong!Password;TrustServerCertificate=True;"

REM Step 1: Clone the repository
if exist "%LOCAL_DIR%" (
    echo Repository already exists at %LOCAL_DIR%. Pulling latest changes...
    cd "%LOCAL_DIR%"
    git pull
) else (
    echo Cloning repository from %REPO_URL% to %LOCAL_DIR%...
    git clone %REPO_URL% "%LOCAL_DIR%"
)

REM Step 2: Drop the database if it exists
echo Dropping the database %DB_NAME% if it exists...
sqlcmd -S localhost -U sa -P "YourNewStrong!Password" -Q "IF DB_ID('%DB_NAME%') IS NOT NULL DROP DATABASE [%DB_NAME%];"
if %errorlevel% neq 0 (
    echo Failed to drop the database. Please check the connection details. Exiting.
    exit /b 1
)
echo Database %DB_NAME% dropped successfully.

REM Step 3: Navigate to the Infrastructure project directory
cd "%LOCAL_DIR%\LexiAuthenAPI.Infrastructure"

REM Step 4: Delete the existing Migrations directory
if exist "%MIGRATIONS_DIR%" (
    echo Deleting existing migrations directory...
    rmdir /s /q "%MIGRATIONS_DIR%"
    echo Migrations directory deleted.
)

REM Step 5: Add a new migration
echo Adding new migration...
dotnet ef migrations add InitialCreate
if %errorlevel% neq 0 (
    echo Migration creation failed. Proceeding with existing migrations (if any)...
)

REM Step 6: Apply migrations to set up the database
echo Applying migrations...
dotnet ef database update --connection %DB_CONNECTION_STRING%
if %errorlevel% neq 0 (
    echo Database setup failed. Exiting.
    exit /b 1
)
echo Database setup completed successfully.

REM Step 7: Navigate to the API project directory
cd "%LOCAL_DIR%\LexiAuthenAPI.Api"

REM Step 8: Build the solution in Debug mode
echo Building the solution in Debug mode...
dotnet build LexiAuthenAPI.Api.sln -c Debug
if %errorlevel% neq 0 (
    echo Build failed. Exiting.
    exit /b 1
)

REM Step 9: Set environment variables
set ASPNETCORE_URLS=https://localhost:5001;http://localhost:5108
set ASPNETCORE_ENVIRONMENT=Development

REM Step 10: Run the application in Debug mode
echo Starting the application in Debug mode...
dotnet "%BUILD_OUTPUT%\LexiAuthenAPI.Api.dll"
if %errorlevel% neq 0 (
    echo Application failed to start. Exiting.
    exit /b 1
)

REM Step 11: Success message
echo Application running in Debug mode.
pause
