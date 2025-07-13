package handler

import (
	"api/internal/models"
	"api/internal/repository"
	"net/http"

	"github.com/gin-gonic/gin"
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
		Verified *bool   `json:"verified"` // ADDED: Field for verification status
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
	CurrentUser := user.(models.User)

	if err := repository.DB.Delete(&CurrentUser).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
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
