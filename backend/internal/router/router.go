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
		// Rotas Públicas
		api.POST("/login", handler.Login) // usuário não autenticado
		api.GET("/profile/:slug", handler.FindProfile) // qualquer usuário
		api.GET("/profile/:slug/metrics", handler.GetProfileMetrics) // qualquer usuário
		api.GET("/profile/:slug/is-owner", middleware.Auth, handler.CheckProfileOwnership) // usuário logado

		userRouter := api.Group("/users")
		userRouter.Use(middleware.Auth)
		{
			userRouter.GET("/me", handler.GetUser) // usuário logado
			userRouter.PUT("/me", handler.UpdateUser) // usuário logado
			userRouter.DELETE("/me", handler.DeleteUser) // usuário logado
			userRouter.GET("/", middleware.AdminAuth, handler.GetAllUsers)  // usuário admin
			userRouter.DELETE("/:slug", middleware.AdminAuth, handler.DeleteUserByAdmin)  // usuário admin
			userRouter.PUT("/:slug/role", middleware.AdminAuth, handler.UpdateUserRole)  // usuário admin
		}

		listingRouter := api.Group("/listings")
		{
			listingRouter.GET("/", handler.GetListings) // qualquer usuário
			listingRouter.GET("/:id", handler.GetListing) // qualquer usuário
			listingRouter.GET("/slug/:slug", handler.GetListingBySlug) // qualquer usuário
			listingRouter.GET("/user/:user_slug", handler.GetListingsByUser) // qualquer usuário
			listingRouter.POST("/", middleware.Auth, handler.CreateListing) // usuário logado
			listingRouter.PUT("/:id", middleware.Auth, handler.UpdateListing) // usuário logado
			listingRouter.DELETE("/:id", middleware.Auth, handler.DeleteListing) // usuário logado
		}

		categorieRouter := api.Group("/categories")
		{
			categorieRouter.GET("/", handler.GetCategories) // qualquer usuário
			categorieRouter.GET("/:id", handler.GetCategory) // qualquer usuário
			categorieRouter.POST("/", middleware.AdminAuth, handler.CreateCategory) // usuário admin
			categorieRouter.PUT("/:id", middleware.AdminAuth, handler.UpdateCategory) // usuário admin
			categorieRouter.DELETE("/:id", middleware.AdminAuth, handler.DeleteCategory) // usuário admin
		}

		listingImageRouter := api.Group("/listing-images")
		{
			listingImageRouter.GET("/", handler.GetListingImages) // qualquer usuário
			listingImageRouter.GET("/:id", handler.GetListingImage) // qualquer usuário
			listingImageRouter.GET("/listing/:listingID", handler.GetListingImagesByListing) // qualquer usuário
			listingImageRouter.POST("/s3", middleware.Auth, handler.GeneratePresignedURL) // usuário logado
			listingImageRouter.POST("/", middleware.Auth, handler.CreateListingImage) // usuário logado
			listingImageRouter.PUT("/:id", middleware.Auth, handler.UpdateListingImage) // usuário logado
			listingImageRouter.DELETE("/:id", middleware.Auth, handler.DeleteListingImage) // usuário logado
		}

		favoriteRouter := api.Group("/favorites")
		favoriteRouter.Use(middleware.Auth)
		{
			favoriteRouter.POST("/", handler.AddFavorite) // usuário logado
			favoriteRouter.GET("/", handler.ListFavorites) // usuário logado
			favoriteRouter.DELETE("/", handler.RemoveFavorite) // usuário logado
			favoriteRouter.GET("/:user_id", handler.ListFavoritesByUser) // usuário logado
		}

		reportRouter := api.Group("/reports")
		reportRouter.Use(middleware.Auth)
		{
			reportRouter.POST("/", handler.CreateReport) // usuário logado
			reportRouter.GET("/", middleware.AdminAuth, handler.GetReports) // usuário admin
			reportRouter.GET("/:id", middleware.AdminAuth, handler.GetReport) // usuário admin
			reportRouter.PUT("/:id/status", middleware.AdminAuth, handler.UpdateReportStatus) // usuário admin
		}
	}

	return router
}