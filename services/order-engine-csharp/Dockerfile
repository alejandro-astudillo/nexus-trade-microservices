# Etapa 1: Base de ejecución (Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Etapa 2: SDK para compilación y desarrollo
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiamos los archivos de proyecto para restaurar dependencias (Capa de caché de Docker)
COPY ["src/NexusTrade.Orders.Api/NexusTrade.Orders.Api.csproj", "src/NexusTrade.Orders.Api/"]
COPY ["src/NexusTrade.Orders.Application/NexusTrade.Orders.Application.csproj", "src/NexusTrade.Orders.Application/"]
COPY ["src/NexusTrade.Orders.Domain/NexusTrade.Orders.Domain.csproj", "src/NexusTrade.Orders.Domain/"]
COPY ["src/NexusTrade.Orders.Infrastructure/NexusTrade.Orders.Infrastructure.csproj", "src/NexusTrade.Orders.Infrastructure/"]

RUN dotnet restore "src/NexusTrade.Orders.Api/NexusTrade.Orders.Api.csproj"

# Copiamos el resto del código y compilamos
COPY . .
WORKDIR "/src/src/NexusTrade.Orders.Api"
RUN dotnet build "NexusTrade.Orders.Api.csproj" -c Release -o /app/build

# Etapa 3: Publicación (Optimización de producción)
FROM build AS publish
RUN dotnet publish "NexusTrade.Orders.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Etapa 4: Imagen Final (Producción)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "NexusTrade.Orders.Api.dll"]
