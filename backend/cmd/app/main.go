package main

import (
	"api/internal/config"
	"api/internal/repository"
	"api/internal/router"
	"log"

	"github.com/robfig/cron/v3"
)

func init() {
	config.LoadEnvs()
	config.InitFirebase()
	config.InitAwsClients()
}

func main() {

	// Connect and migrate the database
	repository.Connect()
	repository.Migrate()

	// Seed previa dos dados:
	if err := repository.Seed(); err != nil {
		log.Fatalf("erro ao executar seed: %v", err)
	}

	c := cron.New()
	// This runs every day at 3:30 AM
	c.AddFunc("30 3 * * *", config.CleanupS3AndDB)
	c.Start()

	r := router.New()
	r.Run(":8080")
}
