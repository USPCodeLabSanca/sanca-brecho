package handler

import (
	"api/internal/models"
	"api/internal/repository"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func AddFavorite(c *gin.Context) {
	var fav models.Favorite
	if err := c.ShouldBindJSON(&fav); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fav.CreatedAt = time.Now().Format(time.RFC3339)

	// Criar o favorito no banco de dados
	if err := repository.DB.Create(&fav).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to favorite listing"})
		return
	}

	// Carregar os dados relacionados (User e Listing) após a criação
	if err := repository.DB.Preload("User").Preload("Listing").First(&fav, "user_id = ? AND listing_id = ?", fav.UserID, fav.ListingID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load related data"})
		return
	}

	c.JSON(http.StatusCreated, fav)
}

func ListFavorites(c *gin.Context) {
	var favorites []models.Favorite

	// Obter todos os favoritos
	if err := repository.DB.Preload("User").Preload("Listing.User").Preload("Listing.Category").Find(&favorites).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch favorites"})
		return
	}

	c.JSON(http.StatusOK, favorites)
}

func RemoveFavorite(c *gin.Context) {
	userID := c.Query("user_id")
	listingID := c.Query("listing_id")

	if userID == "" || listingID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id and listing_id required"})
		return
	}

	if err := repository.DB.Delete(&models.Favorite{}, "user_id = ? AND listing_id = ?", userID, listingID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove favorite"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Favorite removed"})
}

func ListFavoritesByUser(c *gin.Context) {
	userID := c.Param("user_id")

	var favorites []models.Favorite
	if err := repository.DB.Preload("User").Preload("Listing.User").Preload("Listing.Category").Where("user_id = ?", userID).Find(&favorites).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch favorites"})
		return
	}

	c.JSON(http.StatusOK, favorites)
}