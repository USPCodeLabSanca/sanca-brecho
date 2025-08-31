package handler

import (
	"api/internal/models"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	database "api/internal/repository"
)

func CreateSale(c *gin.Context) {
	listingID := c.Param("id")

	var requestBody struct {
		BuyerIdentifier string `json:"buyer_identifier"`
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		var listing models.Listing
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&listing, "id = ?", listingID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("Listing not found")
			} else {
				return errors.New("Failed to retrieve Listing")
			}
		}

		if listing.Status != models.Available {
			return errors.New("Listing not available for sale")
		}

		var buyerID *string

		if requestBody.BuyerIdentifier != "" {
			var buyer models.User
			if err := tx.Where("email = ? OR slug = ?", requestBody.BuyerIdentifier, requestBody.BuyerIdentifier).First(&buyer).Error; err != nil {
				return errors.New("Failed to retrieve Buyer")
			}
			buyerID = &buyer.ID
		}

		listing.Status = models.Sold
		if err := tx.Save(&listing).Error; err != nil {
			return err
		}

		newSale := models.Sale{
			ListingID:  listing.ID,
			SellerID:   listing.UserID,
			BuyerID:    buyerID,
			FinalPrice: listing.Price,
		}
		if err := tx.Create(&newSale).Error; err != nil {
			return err
		}
		c.Set("saleResult", newSale)

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if saleResult, exists := c.Get("saleResult"); exists {
		c.JSON(http.StatusCreated, saleResult)
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create sale"})
	}
}

func GetSalesAsBuyer(c *gin.Context) {
	user_id := c.Param("user_id")

	var sales []models.Sale

	if err := database.DB.Preload("Seller").Preload("Listing").Find(&sales, "buyer_id = ?", user_id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve bought items"})
	}

	c.JSON(http.StatusOK, sales)
}

func GetSalesAsSeller(c *gin.Context) {
	user_id := c.Param("user_id")

	var sales []models.Review

	if err := database.DB.Preload("Buyer").Preload("Listing").Find(&sales, "seller_id = ?", user_id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve sold items"})
	}

	c.JSON(http.StatusOK, sales)
}
