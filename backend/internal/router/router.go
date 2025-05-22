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
		api.GET("/profile/:slug", handler.FindProfile)

		userRouter := api.Group("/user")
		userRouter.Use(middleware.Auth)
		{
			userRouter.GET("/me", handler.GetUser)
			userRouter.PUT("/me", handler.UpdateUser)
			userRouter.DELETE("/me", handler.DeleteUser)
		}
	}

	return router
}
