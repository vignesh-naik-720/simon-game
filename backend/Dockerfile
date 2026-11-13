FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy solution and project files
COPY Simon.slnx ./
COPY src/Simon.Core/Simon.Core.csproj src/Simon.Core/
COPY src/Simon.Infrastructure/Simon.Infrastructure.csproj src/Simon.Infrastructure/
COPY src/Simon.Api/Simon.Api.csproj src/Simon.Api/

# Restore dependencies
RUN dotnet restore src/Simon.Api/Simon.Api.csproj

# Copy source and publish
COPY src/ src/
RUN dotnet publish src/Simon.Api/Simon.Api.csproj -c Release -o /out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Create directory for persistent SQLite data
RUN mkdir -p /app/data
ENV ConnectionStrings__DefaultConnection="Data Source=/app/data/simon.db"
ENV ASPNETCORE_URLS="http://+:5000"

COPY --from=build /out ./
VOLUME ["/app/data"]
EXPOSE 5000

ENTRYPOINT ["dotnet", "Simon.Api.dll"]

