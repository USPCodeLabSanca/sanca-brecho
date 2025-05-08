package config

import (
	"log"

	"github.com/joho/godotenv"
)

func LoadEnvs() {
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ No .env file found, relying on environment variables")
	}
	log.Println("✅ Environment variables loaded successfully")
}
