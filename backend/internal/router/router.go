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
		api.GET("/profile/:slug/is-owner", middleware.Auth, handler.CheckProfileOwnership)
		api.GET("/profile/:slug/metrics", handler.GetProfileMetrics)

		userRouter := api.Group("/users")
		userRouter.Use(middleware.Auth)
		{
			userRouter.GET("/me", handler.GetUser)       // usuário logado
			userRouter.PUT("/me", handler.UpdateUser)    // usuário logado
			userRouter.DELETE("/me", handler.DeleteUser) // usuário logado
		}

		listingRouter := api.Group("/listings")
		{
			listingRouter.GET("/", handler.GetListings)                      // qualquer usuário
			listingRouter.GET("/:id", handler.GetListing)                    // qualquer usuário
			listingRouter.GET("/slug/:slug", handler.GetListingBySlug)       // qualquer usuário
			listingRouter.GET("/user/:user_slug", handler.GetListingsByUser) // qualquer usuário

			listingRouter.Use(middleware.Auth)
			listingRouter.POST("/", handler.CreateListing)      // usuário logado
			listingRouter.PUT("/:id", handler.UpdateListing)    // usuário logado
			listingRouter.DELETE("/:id", handler.DeleteListing) // usuário logado
		}

		categorieRouter := api.Group("/categories")
		{
			categorieRouter.GET("/", handler.GetCategories)  // qualquer usuário
			categorieRouter.GET("/:id", handler.GetCategory) // qualquer usuário

			categorieRouter.Use(middleware.AdminAuth)
			categorieRouter.POST("/", handler.CreateCategory)      // usuário admin
			categorieRouter.PUT("/:id", handler.UpdateCategory)    // usuário admin
			categorieRouter.DELETE("/:id", handler.DeleteCategory) // usuário admin
		}

		listingImageRouter := api.Group("/listing-images")
		{
			listingImageRouter.GET("/", handler.GetListingImages)                            // qualquer usuário
			listingImageRouter.GET("/:id", handler.GetListingImage)                          // qualquer usuário
			listingImageRouter.GET("/listing/:listingID", handler.GetListingImagesByListing) // qualquer usuário

			listingImageRouter.Use(middleware.Auth)
			listingImageRouter.POST("/s3", handler.GeneratePresignedURL) // usuário logado

			listingImageRouter.Use(middleware.AdminAuth)
			listingImageRouter.POST("/", handler.CreateListingImage)      // usuário admin
			listingImageRouter.PUT("/:id", handler.UpdateListingImage)    // usuário admin
			listingImageRouter.DELETE("/:id", handler.DeleteListingImage) // usuário admin
		}

		favoriteRouter := api.Group("/favorites")
		favoriteRouter.Use(middleware.Auth)
		{
			favoriteRouter.POST("/", handler.AddFavorite)                // usuário logado
			favoriteRouter.GET("/", handler.ListFavorites)               // usuário logado
			favoriteRouter.DELETE("/", handler.RemoveFavorite)           // usuário logado
			favoriteRouter.GET("/:user_id", handler.ListFavoritesByUser) // usuário logado
		}

		reportRouter := api.Group("/reports")
		{
			reportRouter.Use(middleware.Auth)
			reportRouter.POST("/", handler.CreateReport) // usuário logado

			reportRouter.Use(middleware.AdminAuth)
			reportRouter.GET("/", handler.GetReports)                   // usuário admin
			reportRouter.GET("/:id", handler.GetReport)                 // usuário admin
			reportRouter.PUT("/:id/status", handler.UpdateReportStatus) // usuário admin
		}
	}

	return router
}
