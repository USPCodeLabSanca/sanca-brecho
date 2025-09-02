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

// @Summary Login
// @Description Rota para realização de login
// @Tags Login
// @Accept json
// @Produce json
// @Param Authorization header string true "Autorizaçao por Bearer token"
// @Success 200 {object} LoginResponse "Usuário logado com sucesso"
// @Failure 401 {object} ErrorResponse "Não autorizado"
// @Failure 403 {object} ErrorResponse "Acesso proibido. Apenas emails universitários permitidos"
// @Failure 500 {object} ErrorResponse "Erro interno"
// @Router /api/login [post]
func Login(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing token"})
		c.Abort()
		return
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Invalid token format"})
		c.Abort()
		return
	}

	idToken := parts[1]

	// Verify the token
	ctx := c.Request.Context()
	token, err := config.AuthClient.VerifyIDToken(ctx, idToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Unauthorized"})
		return
	}

	// Fetch the full Firebase user profile
	userRecord, err := config.AuthClient.GetUser(ctx, token.UID)
	if err != nil {
		fmt.Println(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, ErrorResponse{Error: "failed to load user record"})
		return
	}

	// VALIDATION: Check if the university email is allowed
	universityName, isAllowed := parseUniversity(userRecord.Email)
	if !isAllowed {
		// If email is not allowed, delete the user from Firebase Authentication
		deleteErr := config.AuthClient.DeleteUser(ctx, token.UID)
		if deleteErr != nil {
			fmt.Printf("Error deleting non-institutional user %s from Firebase: %v\n", token.UID, deleteErr)
			c.AbortWithStatusJSON(http.StatusInternalServerError, ErrorResponse{Error: "Falha ao processar login devido a e-mail não institucional. Por favor, tente novamente."})
			return
		}

		c.AbortWithStatusJSON(http.StatusForbidden, ErrorResponse{Error: "Para acessar o Sanca Brechó é necessário utilizar um e-mail de uma instituição de ensino superior."})
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
			University:  universityName, // Use the allowed university name
		}).
		FirstOrCreate(&user)

	if result.Error != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, ErrorResponse{Error: result.Error.Error()})
		return
	}

	// If the record already existed, check for profile changes & save
	if result.RowsAffected == 0 {
		changed := false
		if user.DisplayName != userRecord.DisplayName {
			user.DisplayName = userRecord.DisplayName
			changed = true
		}
		if user.PhotoURL != &userRecord.PhotoURL { // Compare pointers or dereferenced values correctly
			if user.PhotoURL == nil || (user.PhotoURL != nil && *user.PhotoURL != userRecord.PhotoURL) {
				user.PhotoURL = &userRecord.PhotoURL
				changed = true
			}
		}
		// Also update university if it changed based on the email domain
		if user.University == nil || (user.University != nil && *user.University != *universityName) {
			user.University = universityName
			changed = true
		}

		if changed {
			if err := repository.DB.WithContext(ctx).Save(&user).Error; err != nil {
				c.AbortWithStatusJSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
				return
			}
		}
	}

	response := LoginResponse{User: user}

	// Return the user information
	c.JSON(http.StatusOK, response)
}

func parseUniversity(email string) (*string, bool) {
	parts := strings.SplitN(email, "@", 2)
	if len(parts) < 2 {
		return nil, false
	}
	domain := parts[1]

	switch domain {
	case "usp.br":
		u := "Universidade de São Paulo"
		return &u, true
	case "estudante.ufscar.br":
		u := "Universidade Federal de São Carlos"
		return &u, true
	case "aluno.ifsp.edu.br":
		u := "Instituto Federal de São Paulo"
		return &u, true
	default:
		return nil, false
	}
}
