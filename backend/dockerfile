# Use a base image with Go installed
FROM golang:1.24-alpine

WORKDIR /app

RUN go install github.com/air-verse/air@latest

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Expose the application port
EXPOSE 8080

# Use Air for live reload
CMD ["air", "-c", ".air.toml"]
