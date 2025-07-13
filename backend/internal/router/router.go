package router

import (
	"api/internal/handler"
	"api/internal/middleware"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func New() *gin.Engine {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost", os.Getenv("FRONTEND_URL")}, // Dominios permitidos, (localhost para testes)
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

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
			listingRouter.GET("/", handler.GetListings)
			listingRouter.POST("/", handler.CreateListing)
			listingRouter.GET("/:id", handler.GetListing)
			listingRouter.GET("/slug/:slug", handler.GetListingBySlug)
			listingRouter.PUT("/:id", handler.UpdateListing)
			listingRouter.DELETE("/:id", handler.DeleteListing)
		}

		categorieRouter := api.Group("/categories")
		{
			categorieRouter.GET("/", handler.GetCategories)
			categorieRouter.POST("/", handler.CreateCategory)
			categorieRouter.GET("/:id", handler.GetCategory)
			categorieRouter.PUT("/:id", handler.UpdateCategory)
			categorieRouter.DELETE("/:id", handler.DeleteCategory)
		}

		listingImageRouter := api.Group("/listing-images")
		{
			listingImageRouter.POST("/s3", handler.GeneratePresignedURL)
			listingImageRouter.POST("/", handler.CreateListingImage)
			listingImageRouter.GET("/", handler.GetListingImages)
			listingImageRouter.GET("/:id", handler.GetListingImage)
			listingImageRouter.GET("/listing/:listingID", handler.GetListingImagesByListing)
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
