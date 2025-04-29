package main

import (
	"api/controllers"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.GET("/", controllers.HelloWorld)
	router.Run(":8080")
}
