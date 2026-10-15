package handler

import (
	"api/internal/models"
	"errors"
	"log"
	"net/http"

	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	database "api/internal/repository"
)

var (
	errListingNotFound    = errors.New("listing not found")
	errListingUnavailable = errors.New("listing unavailable")
	errBuyerNotFound      = errors.New("buyer not found")
	errNotListingOwner    = errors.New("not listing owner")
)

func CreateSale(c *gin.Context) {
	user, _ := c.Get("currentUser")
	currentUser := user.(models.User)
	listingID := c.Param("id")

	var requestBody struct {
		BuyerIdentifier string  `json:"buyer_identifier"`
		FinalPrice      float64 `json:"final_price"`
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		log.Printf("CreateSale: corpo inválido: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados da venda inválidos. Confira os campos e tente novamente."})
		return
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		var listing models.Listing
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&listing, "id = ?", listingID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errListingNotFound
			}
			return err
		}

		if listing.UserID != currentUser.ID {
			return errNotListingOwner
		}

		if listing.Status != models.Available {
			return errListingUnavailable
		}

		var buyerID *string
		if requestBody.BuyerIdentifier != "" {
			var buyer models.User
			if err := tx.Where("email = ? OR slug = ?", requestBody.BuyerIdentifier, requestBody.BuyerIdentifier).First(&buyer).Error; err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return errBuyerNotFound
				}
				return err
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
		switch {
		case errors.Is(err, errListingNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": "Anúncio não encontrado."})
		case errors.Is(err, errNotListingOwner):
			c.JSON(http.StatusForbidden, gin.H{"error": "Você só pode marcar como vendido um anúncio seu."})
		case errors.Is(err, errListingUnavailable):
			c.JSON(http.StatusConflict, gin.H{"error": "Este anúncio não está mais disponível para venda."})
		case errors.Is(err, errBuyerNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuário comprador não encontrado. Verifique o email ou slug."})
		default:
			log.Printf("CreateSale: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Não foi possível registrar a venda. Tente novamente em instantes."})
		}
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

// helper que apaga vendas e avaliações ligadas aos anuncios
func DeleteSalesForListings(tx *gorm.DB, listingIDs []uuid.UUID) error {
	if len(listingIDs) == 0 {
		return nil
	}
	var saleIDs []uuid.UUID
	if err := tx.Model(&models.Sale{}).
		Where("listing_id IN ?", listingIDs).
		Pluck("id", &saleIDs).Error; err != nil {
		return err
	}
	if len(saleIDs) == 0 {
		return nil
	}
	if err := tx.Where("sale_id IN ?", saleIDs).Delete(&models.Review{}).Error; err != nil {
		return err
	}
	return tx.Where("id IN ?", saleIDs).Delete(&models.Sale{}).Error
}
