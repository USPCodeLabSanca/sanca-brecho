package handler

import (
	"api/internal/config"
	"api/internal/models"
	"api/internal/repository"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func Login(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing token"})
		c.Abort()
		return
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
		c.Abort()
		return
	}

	idToken := parts[1]

	// Verify the token
	ctx := c.Request.Context()
	token, err := config.AuthClient.VerifyIDToken(ctx, idToken)
	if err != nil {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	// Fetch the full Firebase user profile
	userRecord, err := config.AuthClient.GetUser(ctx, token.UID)
	if err != nil {
		fmt.Println(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to load user record"})
		return
	}

	// Get the user from the token
	var user models.User
	result := repository.DB.
		WithContext(ctx).
		Where(models.User{ID: userRecord.UID}).
		Attrs(models.User{
			DisplayName: userRecord.DisplayName,
			Email:       userRecord.Email,
			PhotoURL:    &userRecord.PhotoURL,
			University:  parseUniversity(userRecord.Email),
		}).
		FirstOrCreate(&user)

	if result.Error != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	// If the record already existed, check for profile changes & save
	if result.RowsAffected == 0 {
		changed := false
		if user.DisplayName != userRecord.DisplayName {
			user.DisplayName = userRecord.DisplayName
			changed = true
		}
		if user.PhotoURL != &userRecord.PhotoURL {
			user.PhotoURL = &userRecord.PhotoURL
			changed = true
		}
		if changed {
			if err := repository.DB.WithContext(ctx).Save(&user).Error; err != nil {
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}
	}

	// Return the user information
	c.JSON(http.StatusOK, gin.H{"user": user})
}

func parseUniversity(email string) *string {
	domain := strings.SplitN(email, "@", 2)[1]
	switch domain {
	case "usp.br":
		u := "Universidade de São Paulo"
		return &u
	case "estudante.ufscar.br":
		u := "Universidade Federal de São Carlos"
		return &u
	case "aluno.ifsp.edu.br":
		u := "Instituto Federal de São Paulo"
		return &u
	default:
		return nil
	}
}
