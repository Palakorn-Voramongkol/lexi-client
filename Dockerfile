# Use the official .NET SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the entire solution and project files
COPY lexi2-authen .

# Navigate to the API project directory
WORKDIR /app/LexiAuthenAPI.Api

# Step 2: Build the solution in Debug mode
RUN echo Building the solution in Debug mode... && \
    ls && \
    dotnet build ./LexiAuthenAPI.Api.sln -c Debug

# Use the official runtime image to run the app
FROM mcr.microsoft.com/dotnet/aspnet:8.0

# Set the working directory inside the container
WORKDIR /app

# Copy the Debug output from the build stage
COPY --from=build /app/LexiAuthenAPI.Api/bin/Debug/net8.0 .


# Step 4: Set environment variables
ENV ASPNETCORE_URLS="https://localhost:5001;http://localhost:5108"
ENV ASPNETCORE_ENVIRONMENT=Development

# Step 5: Run the application in Debug mode
ENTRYPOINT ["dotnet", "/app/lexi2-authen/LexiAuthenAPI.Api/bin/Debug/net8.0/LexiAuthenAPI.Api.dll"]

# Use tail to keep the container running
#ENTRYPOINT ["tail", "-f", "/dev/null"]