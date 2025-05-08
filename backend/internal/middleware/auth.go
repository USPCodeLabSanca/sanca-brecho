package middleware

import (
	"api/internal/config"
	"api/internal/models"
	"api/internal/repository"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware verifies the Bearer token and fetches the user.
// It expects an "Authorization" header in the format "Bearer <token>".
func Auth(c *gin.Context) {
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

	// Verify the ID token with Firebase
	ctx := c.Request.Context()
	token, err := config.AuthClient.VerifyIDToken(ctx, idToken)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Upsert the user
	var user models.User
	err = repository.DB.Where("id = ?", token.UID).Find(&user).Error
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
	}

	c.Set("currentUser", user)

	c.Next()
}
