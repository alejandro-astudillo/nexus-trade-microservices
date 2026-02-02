# Build Stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install dependencies
COPY go.mod go.sum* ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
# CGO_ENABLED=0 ensures a statically linked binary
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/pricing-service ./cmd/api

# Run Stage
FROM gcr.io/distroless/static-debian12

WORKDIR /app

COPY --from=builder /app/pricing-service .

# Expose the port
EXPOSE 8080

CMD ["./pricing-service"]
