package handler

import (
	"github.com/gin-gonic/gin"
)

func CreateListing(c *gin.Context) {
	// var listing models.Listing
	// if err := c.ShouldBindJSON(&listing); err != nil {
	// 	c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	// }

	// listing.ID = uuid.New().String()

	// if err := database.DB.Create(&listing).Error; err != nil {
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Listing"})
	// 	return
	// }

	// c.JSON(http.StatusCreated, listing)
}

func GetListing(c *gin.Context) {

}

func UpdateListing(c *gin.Context) {

}

func DeleteListing(c *gin.Context) {

}
