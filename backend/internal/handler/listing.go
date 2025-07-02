package handler

import (
	"api/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	database "api/internal/repository"
)

func CreateListing(c *gin.Context) {
	var listing models.Listing
	if err := c.ShouldBindJSON(&listing); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	}

	listing.ID = uuid.New()

	if err := database.DB.Create(&listing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Listing"})
		return
	}

	c.JSON(http.StatusCreated, listing)
}

func GetListings(c *gin.Context) {
	var listings []models.Listing

	if err := database.DB.Preload("User").Preload("Category").Find(&listings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve listings"})
		return
	}

	c.JSON(http.StatusOK, listings)
}

func GetListing(c *gin.Context) {
	id := c.Param("id")

	var listing models.Listing

	if err := database.DB.Preload("User").Preload("Category").First(&listing, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
	}

	c.JSON(http.StatusOK, listing)
}

func UpdateListing(c *gin.Context) {
	id := c.Param("id")

	// Pegar o listing
	var existing models.Listing
	if err := database.DB.First(&existing, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		return
	}

	var updates models.Listing
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error ": err.Error()})
		return
	}

	if err := database.DB.Model(&existing).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update listing"})
		return
	}

	c.JSON(http.StatusOK, existing)
}

func DeleteListing(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Listing{}, "id=?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete listing"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"messa": "Listing deleted successfully"})
}
