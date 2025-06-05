package handler

import (
	"api/internal/models"
	"api/internal/repository"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func CreateListingImage(c *gin.Context) {
	var img models.ListingImage
	if err := c.ShouldBindJSON(&img); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	img.ID = uuid.New()

	if err := repository.DB.Create(&img).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create image"})
		return
	}

	c.JSON(http.StatusCreated, img)
}

func GetListingImage(c *gin.Context) {
	id := c.Param("id")
	var img models.ListingImage

	if err := repository.DB.First(&img, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	c.JSON(http.StatusOK, img)
}

func UpdateListingImage(c *gin.Context) {
	id := c.Param("id")
	var existing models.ListingImage

	if err := repository.DB.First(&existing, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	var update models.ListingImage
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	repository.DB.Model(&existing).Updates(update)
	c.JSON(http.StatusOK, existing)
}

func DeleteListingImage(c *gin.Context) {
	id := c.Param("id")
	if err := repository.DB.Delete(&models.ListingImage{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete image"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Image deleted"})
}
