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
		BuyerIdentifier string  `json:"buyer_identifier"`
		FinalPrice      float64 `json:"final_price"`
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		var listing models.Listing
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&listing, "id = ?", listingID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("listing not found")
			} else {
				return errors.New("failed to retrieve Listing")
			}
		}

		if listing.Status != models.Available {
			return errors.New("listing not available for sale")
		}

		var buyerID *string

		if requestBody.BuyerIdentifier != "" {
			var buyer models.User
			if err := tx.Where("email = ? OR slug = ?", requestBody.BuyerIdentifier, requestBody.BuyerIdentifier).First(&buyer).Error; err != nil {
				return errors.New("failed to retrieve Buyer")
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
			FinalPrice: requestBody.FinalPrice,
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

func GetSale(c *gin.Context) {
	saleID := c.Param("id")

	var sale models.Sale

	if err := database.DB.Preload("Seller").Preload("Buyer").Preload("Listing").Preload("Review").Find(&sale, "id = ?", saleID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve sale"})
		return
	}

	c.JSON(http.StatusOK, sale)
}

func GetSalesAsBuyer(c *gin.Context) {
	user, _ := c.Get("currentUser")
	currentUser := user.(models.User)

	var sales []models.Sale

	if err := database.DB.Preload("Seller").Preload("Listing").Preload("Review").Find(&sales, "buyer_id = ?", currentUser.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve bought items"})
		return
	}

	c.JSON(http.StatusOK, sales)
}

func GetSalesAsSeller(c *gin.Context) {
	user, _ := c.Get("currentUser")
	currentUser := user.(models.User)

	var sales []models.Sale

	if err := database.DB.Preload("Buyer").Preload("Listing").Preload("Review").Find(&sales, "seller_id = ?", currentUser.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve sold items"})
		return
	}

	c.JSON(http.StatusOK, sales)
}
