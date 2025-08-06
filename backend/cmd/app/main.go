package main

import (
	"api/internal/config"
	"api/internal/repository"
	"api/internal/router"
	"log"
)

func init() {
	config.LoadEnvs()
	config.InitFirebase()
	config.InitAwsPresignClient()
}

func main() {

	// Connect and migrate the database
	repository.Connect()
	repository.Migrate()

	// Seed previa dos dados:
	if err := repository.Seed(); err != nil {
		log.Fatalf("erro ao executar seed: %v", err)
	}

	r := router.New()
	r.Run(":8080")
}
