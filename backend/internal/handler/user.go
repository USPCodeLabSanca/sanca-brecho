package handler

import (
	"api/internal/config"
	"api/internal/models"
	"api/internal/repository"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func GetUser(c *gin.Context) {
	user, _ := c.Get("currentUser")
	CurrentUser := user.(models.User)

	c.JSON(http.StatusOK, gin.H{"user": CurrentUser})
}

func UpdateUser(c *gin.Context) {
	user, _ := c.Get("currentUser")
	CurrentUser := user.(models.User)

	type UpdateUserRequest struct {
		PhotoURL *string `json:"photo_url"`
		Whatsapp *string `json:"whatsapp"`
		Telegram *string `json:"telegram"`
		Verified *bool   `json:"verified"`
	}
	var request UpdateUserRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Update the user in the database
	if request.PhotoURL != nil {
		CurrentUser.PhotoURL = request.PhotoURL
	}
	if request.Whatsapp != nil {
		CurrentUser.Whatsapp = request.Whatsapp
	}
	if request.Telegram != nil {
		CurrentUser.Telegram = request.Telegram
	}
	if request.Verified != nil {
		CurrentUser.Verified = *request.Verified
	}

	// Save the updated user
	if err := repository.DB.Save(&CurrentUser).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": CurrentUser})
}

func DeleteUser(c *gin.Context) {
	user, _ := c.Get("currentUser")
	currentUser := user.(models.User)
	userID := currentUser.ID

	// Use a transaction to ensure all or nothing is deleted
	err := repository.DB.Transaction(func(tx *gorm.DB) error {
		var listings []models.Listing
		if err := tx.Where("user_id = ?", userID).Find(&listings).Error; err != nil {
			return err
		}

		if len(listings) > 0 {
			var listingIDs []uuid.UUID
			for _, l := range listings {
				listingIDs = append(listingIDs, l.ID)
			}
			// delete all images associated with the user's listings
			if err := tx.Where("listing_id IN ?", listingIDs).Delete(&models.ListingImage{}).Error; err != nil {
				return err
			}
			// delete all favorites associated with the user's listings
			if err := tx.Where("listing_id IN ?", listingIDs).Delete(&models.Favorite{}).Error; err != nil {
				return err
			}
		}

		// delete favorites associated with the user
		if err := tx.Where("user_id = ?", userID).Delete(&models.Favorite{}).Error; err != nil {
			return err
		}
		// delete the user's listings
		if err := tx.Where("user_id = ?", userID).Delete(&models.Listing{}).Error; err != nil {
			return err
		}
		// delete the user
		if err := tx.Where("id = ?", userID).Delete(&models.User{}).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user and associated data"})
		return
	}

	// delete from firebase after the transaction is successful
	ctx := c.Request.Context()
	if err := config.AuthClient.DeleteUser(ctx, userID); err != nil {
		// this is a critical error (user is deleted from the database but not from firebase) maybe we should log it to fix it later
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user from authentication service"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

func CheckProfileOwnership(c *gin.Context) {
	profileSlug := c.Param("slug")

	currentUser, exists := c.Get("currentUser")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}
	loggedInUser := currentUser.(models.User)

	var profileOwner models.User
	if err := repository.DB.Where("slug = ?", profileSlug).First(&profileOwner).Error; err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{"is_owner": false, "message": "Profile not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve profile owner"})
		}
		return
	}

	if loggedInUser.ID == profileOwner.ID {
		c.JSON(http.StatusOK, gin.H{"is_owner": true})
	} else {
		c.JSON(http.StatusOK, gin.H{"is_owner": false})
	}
}

func FindProfile(c *gin.Context) {
	slug := c.Param("slug")

	var user models.User
	result := repository.DB.Where("slug=?", slug).Find(&user)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"messsage": result.Error.Error()})
		return
	}

	// Only public data
	resp := models.Profile{
		DisplayName: user.DisplayName,
		Slug:        user.Slug,
		Email:       user.Email,
		PhotoURL:    user.PhotoURL,
		University:  user.University,
		Whatsapp:    user.Whatsapp,
		Telegram:    user.Telegram,
		Verified:    user.Verified,
		CreatedAt:   user.CreatedAt,
		Role:        user.Role,
	}

	c.JSON(http.StatusOK, gin.H{"user": resp})

}

func GetProfileMetrics(c *gin.Context) {
	userSlug := c.Param("slug")

	// Finding the user by slug
	var user models.User
	if err := repository.DB.Where("slug=?", userSlug).First(&user).Error; err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		}
		return
	}

	// starting the metrics struct
	var metrics models.SellerMetrics

	// Fetching the metrics data
	metrics.IsVerified = user.Verified
	if (user.Whatsapp != nil && *user.Whatsapp != "") || (user.Telegram != nil && *user.Telegram != "") {
		metrics.ProfileIsComplete = true
	} else {
		metrics.ProfileIsComplete = false
	}

	// Counting active listings
	repository.DB.Model(&models.Listing{}).Where("user_id = ? AND status = ?", user.ID, models.Available).Count(&metrics.ActiveListingsCount)
	repository.DB.Model(&models.Listing{}).Where("user_id = ? AND status = ?", user.ID, models.Sold).Count(&metrics.ItemsSold)

	// Counting total listings
	repository.DB.Model(&models.Listing{}).Where("user_id = ?", user.ID).Count(&metrics.TotalListingsCount)

	// Counting total favorites
	var listingIDs []uuid.UUID
	repository.DB.Model(&models.Listing{}).Where("user_id = ?", user.ID).Pluck("id", &listingIDs)
	if len(listingIDs) > 0 {
		repository.DB.Model(&models.Favorite{}).Where("listing_id IN ?", listingIDs).Count(&metrics.TotalFavoritesCount)
	}

	// Setting the member since date
	if !user.CreatedAt.IsZero() {
		metrics.MemberSince = &user.CreatedAt
	} else {
		metrics.MemberSince = nil
	}

	c.JSON(http.StatusOK, gin.H{"metrics": metrics})
}
