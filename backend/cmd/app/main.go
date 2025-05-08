package main

import (
	"api/internal/config"
	"api/internal/repository"
	"api/internal/router"
)

func init() {
	config.LoadEnvs()
	config.InitFirebase()
}

func main() {

	// Connect and migrate the database
	repository.Connect()
	repository.Migrate()

	r := router.New()
	r.Run(":8080")
}
