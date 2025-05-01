package main

import (
	"api/controllers"
	"api/internal/database"
	"api/services"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func init() {
	services.LoadEnvs()
}

func main() {

	// Verifing .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file")
	}

	// Connecting to the database
	database.Connect()
	// Migrate the database
	database.Migrate()

	log.Printf("✅ Database connected successfully")

	router := gin.Default()
	router.GET("/", controllers.HelloWorld)
	router.Run(":8080")

}
