package handler

import (
	"api/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	database "api/internal/repository"
)

func CreateReview(c *gin.Context) {
	id := c.Param("id")

	var requestBody struct {
		Rating  int    `json:"rating"`
		Comment string `json:"comment"`
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var sale models.Sale

	if err := database.DB.First(&sale, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sale not found"})
		return
	}

	var review models.Review

	review.ID = uuid.New()
	review.SaleID = sale.ID
	review.Rating = requestBody.Rating
	review.Comment = requestBody.Comment

	if err := database.DB.Create(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Review"})
		return
	}

	if err := database.DB.First(&review, "id = ?", review.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load related data"})
		return
	}

	c.JSON(http.StatusCreated, review)
}

func GetReviewsReceived(c *gin.Context) {
	user_id := c.Param("user_id")

	var reviews []models.Review

	if err := database.DB.Preload("Sale.Seller").Preload("Sale.Buyer").Preload("Sale.Listing").Joins("JOIN sales ON sales.id = reviews.sale_id").Where("sales.seller_id = ?", user_id).Order("reviews.created_at DESC").Find(&reviews).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve Reviews"})
		return
	}

	c.JSON(http.StatusOK, reviews)
}

func GetReviewsSent(c *gin.Context) {
	user_id := c.Param("user_id")

	var reviews []models.Review

	if err := database.DB.Preload("Sale.Seller").Preload("Sale.Buyer").Preload("Sale.Listing").Joins("JOIN sales ON sales.id = reviews.sale_id").Where("sales.buyer_id = ?", user_id).Order("reviews.created_at DESC").Find(&reviews).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve Reviews"})
		return
	}

	c.JSON(http.StatusOK, reviews)
}
