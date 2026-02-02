# --- Stage 1: Base / Development ---
FROM eclipse-temurin:21-jdk-jammy AS dev
WORKDIR /app

# Copy maven wrapper and pom first to leverage Docker cache
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline

# Copy source code
COPY src ./src

# Expose port for dev
EXPOSE 8080
# Hot reload command (requires mounting volumes in docker-compose)
CMD ["./mvnw", "spring-boot:run"]

# --- Stage 2: Builder for Production ---
FROM dev AS build
RUN ./mvnw clean package -DskipTests

# --- Stage 3: Production Runtime ---
FROM eclipse-temurin:21-jre-jammy AS prod
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
