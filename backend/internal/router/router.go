package router

import (
	"api/internal/handler"
	"api/internal/middleware"

	"github.com/gin-gonic/gin"
)

func New() *gin.Engine {
	router := gin.Default()

	api := router.Group("/api")
	{
		api.POST("/login", handler.Login)

		userRouter := api.Group("/user")
		userRouter.Use(middleware.Auth)
		{
			userRouter.GET("/", handler.GetUser)
			userRouter.PUT("/", handler.UpdateUser)
			userRouter.DELETE("/", handler.DeleteUser)
		}
	}

	return router
}
