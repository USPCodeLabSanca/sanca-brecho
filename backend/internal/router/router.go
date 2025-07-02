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

		userRouter := api.Group("/users")
		userRouter.Use(middleware.Auth)
		{
			userRouter.GET("/me", handler.GetUser)
			userRouter.PUT("/me", handler.UpdateUser)
			userRouter.DELETE("/me", handler.DeleteUser)
		}

		listingRouter := api.Group("/listings")
		{
			listingRouter.POST("/", handler.CreateListing)
			listingRouter.GET("/", handler.GetListings)
			listingRouter.GET("/:id", handler.GetListing)
			listingRouter.PUT("/:id", handler.UpdateListing)
			listingRouter.DELETE("/:id", handler.DeleteListing)
		}

		categorieRouter := api.Group("/categories")
		{
			categorieRouter.POST("/", handler.CreateCategory)
			categorieRouter.GET("/", handler.GetCategories)
			categorieRouter.GET("/:id", handler.GetCategory)
			categorieRouter.PUT("/:id", handler.UpdateCategory)
			categorieRouter.DELETE("/:id", handler.DeleteCategory)
		}

		listingImageRouter := api.Group("/listing-images")
		{
			listingImageRouter.POST("/", handler.CreateListingImage)
			listingImageRouter.GET("/", handler.GetListingImages)
			listingImageRouter.GET("/:id", handler.GetListingImage)
			listingImageRouter.PUT("/:id", handler.UpdateListingImage)
			listingImageRouter.DELETE("/:id", handler.DeleteListingImage)
		}

		favoriteRouter := api.Group("/favorites")
		{
			favoriteRouter.POST("/", handler.AddFavorite)
			favoriteRouter.GET("/", handler.ListFavorites)
			favoriteRouter.DELETE("/", handler.RemoveFavorite)
			favoriteRouter.GET("/:user_id", handler.ListFavoritesByUser)
		}

	}

	return router
}
