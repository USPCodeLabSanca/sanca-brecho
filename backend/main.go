package main

import (
	"api/controllers"
	"api/services"

	"github.com/gin-gonic/gin"
)

func init() {
	services.LoadEnvs()
}

func main() {
	router := gin.Default()
	router.GET("/", controllers.HelloWorld)
	router.Run(":8080")
}
