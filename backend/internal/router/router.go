package router

import (
	"api/internal/handler"
	"api/internal/middleware"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	swaggerfiles "github.com/swaggo/files"
	ginswagger "github.com/swaggo/gin-swagger"
	_ "api/internal/handler/docs"

)

// @title Sanca Brecho Backend service
// @version 1.0
// @description Serviços disponibilizados pela API do Sanca Brecho
// @contact.name API Support zap zap
// @BasePath /

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
		api.GET("/swagger/*any", ginswagger.WrapHandler(swaggerfiles.Handler))

		api.POST("/login", handler.Login)
		api.GET("/profile/:slug", handler.FindProfile)
		api.GET("/profile/:slug/is-owner", middleware.Auth, handler.CheckProfileOwnership)
		api.GET("/profile/:slug/metrics", handler.GetProfileMetrics)

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
			listingRouter.GET("/search", handler.GetListingsSearch)
			listingRouter.POST("/", handler.CreateListing)
			listingRouter.GET("/:id", handler.GetListing)
			listingRouter.GET("/slug/:slug", handler.GetListingBySlug)
			listingRouter.GET("/user/:user_slug", handler.GetListingsByUser)
			listingRouter.PUT("/:id", handler.UpdateListing)
			listingRouter.DELETE("/:id", handler.DeleteListing)
			listingRouter.POST("/:id/sell", handler.CreateSale)
		}

		salesRouter := api.Group("/sales")
		salesRouter.Use(middleware.Auth)
		{
			salesRouter.GET("/:id", handler.GetSale)
			salesRouter.GET("/buyer", handler.GetSalesAsBuyer)
			salesRouter.GET("/seller", handler.GetSalesAsSeller)
			salesRouter.POST("/:id/review", handler.CreateReview)
		}

		reviewRouter := api.Group("/reviews")
		{
			reviewRouter.GET("/:user_slug/sent", handler.GetReviewsSent)
			reviewRouter.GET("/:user_slug/received", handler.GetReviewsReceived)
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

		reportRouter := api.Group("/reports")
		reportRouter.Use(middleware.Auth)
		{
			reportRouter.POST("/", handler.CreateReport)
			reportRouter.GET("/", middleware.AdminAuth, handler.GetReports)
			reportRouter.GET("/:id", middleware.AdminAuth, handler.GetReport)
			reportRouter.PUT("/:id/status", middleware.AdminAuth, handler.UpdateReportStatus)
		}
	}

	return router
}
