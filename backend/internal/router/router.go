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

	router.SetTrustedProxies(nil)

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost", os.Getenv("FRONTEND_URL")}, // Dominios permitidos, (localhost para testes)
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := router.Group("/brechoapi")
	{
		// Rotas Públicas
		api.POST("/login", handler.Login)                                                  // usuário não autenticado
		api.GET("/profile/:slug", handler.FindProfile)                                     // qualquer usuário
		api.GET("/profile/:slug/metrics", handler.GetProfileMetrics)                       // qualquer usuário
		api.GET("/profile/:slug/is-owner", middleware.Auth, handler.CheckProfileOwnership) // usuário logado
		api.GET("/profile/:slug/contact", middleware.Auth, handler.GetProfileContact)      // usuário logado

		api.GET("/admin/stats", middleware.AdminAuth, handler.GetDashboardStats) // usuário admin

		userRouter := api.Group("/users")
		userRouter.Use(middleware.Auth)
		{
			userRouter.GET("/me", handler.GetUser)                                       // usuário logado
			userRouter.PUT("/me", handler.UpdateUser)                                    // usuário logado
			userRouter.DELETE("/me", handler.DeleteUser)                                 // usuário logado
			userRouter.GET("/", middleware.AdminAuth, handler.GetUsers)                  // usuário admin
			userRouter.DELETE("/:slug", middleware.AdminAuth, handler.DeleteUserByAdmin) // usuário admin
			userRouter.PUT("/:slug/role", middleware.AdminAuth, handler.UpdateUserRole)  // usuário admin
		}

		listingRouter := api.Group("/listings")
		{
			// qualquer usuario
			listingRouter.GET("/", handler.GetListings)
			listingRouter.GET("/search", handler.GetListingsSearch)
			listingRouter.GET("/:id", handler.GetListing)
			listingRouter.GET("/slug/:slug", handler.GetListingBySlug)
			listingRouter.GET("/user/:user_slug", handler.GetListingsByUser)

			// usuarios logados
			listingRouter.Use(middleware.Auth)
			listingRouter.POST("/", handler.CreateListing)
			listingRouter.PUT("/:id", handler.UpdateListing)
			listingRouter.DELETE("/:id", handler.DeleteListing)
			listingRouter.POST("/:id/sell", handler.CreateSale)

			// apenas admins
			listingRouter.GET("/admin", middleware.AdminAuth, handler.GetListingsAdmin)
			listingRouter.DELETE("/admin/:id", middleware.AdminAuth, handler.DeleteListingByAdmin)
			listingRouter.PUT("/admin/:id/status", middleware.AdminAuth, handler.UpdateListingStatusByAdmin)
		}

		salesRouter := api.Group("/sales")
		salesRouter.Use(middleware.Auth)
		{
			salesRouter.GET("/:id", handler.GetSale)              // usuário logado
			salesRouter.GET("/buyer", handler.GetSalesAsBuyer)    // usuário logado
			salesRouter.GET("/seller", handler.GetSalesAsSeller)  // usuário logado
			salesRouter.POST("/:id/review", handler.CreateReview) // usuário logado
		}

		reviewRouter := api.Group("/reviews")
		{
			reviewRouter.GET("/:user_slug/sent", handler.GetReviewsSent)         // qualquer usuário
			reviewRouter.GET("/:user_slug/received", handler.GetReviewsReceived) // qualquer usuário
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
			listingImageRouter.POST("/s3", handler.GeneratePresignedURL)  // usuário logado
			listingImageRouter.POST("/", handler.CreateListingImage)      // usuário logado
			listingImageRouter.DELETE("/:id", handler.DeleteListingImage) // usuário logado
			listingImageRouter.PUT("/:id", handler.UpdateListingImage)    // usuário logado
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
