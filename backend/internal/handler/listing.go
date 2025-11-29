package handler

import (
	"api/internal/models"
	"net/http"
	"strconv"

	database "api/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var publicUserFields = "id, display_name, slug, photo_url, university, verified, role, created_at"

func checkIsAdmin(c *gin.Context) bool {
	user, exists := c.Get("currentUser")
	if !exists {
		return false
	}

	currentUser, ok := user.(models.User)
	if !ok {
		return false
	}

	return currentUser.Role == models.RoleAdmin
}

func CreateListing(c *gin.Context) {
	user, _ := c.Get("currentUser")
	CurrentUser := user.(models.User)

	if !CurrentUser.Verified {
		c.JSON(http.StatusForbidden, gin.H{"error": "User not verified"})
		return
	}

	var listing models.Listing
	if err := c.ShouldBindJSON(&listing); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(listing.Title) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Title too long"})
		return
	}

	if len(listing.Description) > 1000 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Description too long"})
		return
	}

	var userActiveListings []models.Listing
	if err := database.DB.
		Preload("User", func(db *gorm.DB) *gorm.DB {
			return db.Select(publicUserFields)
		}).
		Preload("Category").
		Where("user_id = ? AND status = ?", CurrentUser.ID, models.Available).
		Find(&userActiveListings).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve listings"})
		return
	}

	if len(userActiveListings) > 20 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You cannot create more than 5 active listings"})
		return
	}

	//generate UUID for the listing ID
	listing.ID = uuid.New()
	//setting the status to available
	listing.Status = models.Available

	var category models.Category
	if err := database.DB.First(&category, "id = ?", listing.CategoryID).Error; err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid CategoryID"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve category"})
		}
		return
	}

	// Creating the listing
	if err := database.DB.Create(&listing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Listing"})
		return
	}

	// Loading related data to return in the response
	if err := database.DB.Preload("User", func(db *gorm.DB) *gorm.DB {
		return db.Select(publicUserFields)
	}).Preload("Category").First(&listing, "id = ?", listing.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load related data"})
		return
	}

	c.JSON(http.StatusCreated, listing)
}

func GetListings(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("pageSize", "20")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid `page` param"})
		return
	}

	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil || pageSize < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid `pageSize` param"})
		return
	}

	offset := (page - 1) * pageSize

	var total int64
	if err := database.DB.Model(&models.Listing{}).
		Where("status = ?", models.Available).
		Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count listings"})
		return
	}

	// paginated query recents listings
	var listings []models.Listing
	if err := database.DB.
		Preload("User", func(db *gorm.DB) *gorm.DB {
			return db.Select(publicUserFields)
		}).
		Preload("Category").
		Where("status = ?", models.Available).
		Order("created_at desc, id desc").
		Limit(pageSize).
		Offset(offset).
		Find(&listings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve listings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":     listings,
		"page":     page,
		"pageSize": pageSize,
		"total":    total,
	})
}

// query param is mandatory. page and pageSize are optional. page starts at 1.
// if page and pageSize are not provided, the default is 1 and 10 respectively.
func GetListingsSearch(c *gin.Context) {
	q := c.Query("q")
	if q == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing `q` param"})
		return
	}

	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("pageSize", "20")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid `page` param"})
		return
	}

	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil || pageSize < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid `pageSize` param"})
		return
	}

	// perform full-text search for the paginated results
	results, err := database.SearchListingsFTS(q, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal error"})
		return
	}

	// compute total matching entries for pagination
	var total int64
	db := database.DB.Model(&models.Listing{})
	likePattern := "%" + q + "%"

	// if not admin, only count available (same behavior as other endpoints)
	if !checkIsAdmin(c) {
		if err := db.Where("status = ? AND (title ILIKE ? OR description ILIKE ?)", models.Available, likePattern, likePattern).Order("created_at desc, id desc").Count(&total).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count listings"})
			return
		}
	} else {
		if err := db.Where("(title ILIKE ? OR description ILIKE ?)", likePattern, likePattern).Order("created_at desc, id desc").Count(&total).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count listings"})
			return
		}
	}

	// ensure non-nil slice in response
	if results == nil {
		results = []models.Listing{}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":     results,
		"page":     page,
		"pageSize": pageSize,
		"total":    total,
	})
}

func GetListing(c *gin.Context) {
	id := c.Param("id")

	var listing models.Listing

	query := database.DB.Preload("User", func(db *gorm.DB) *gorm.DB {
		return db.Select(publicUserFields)
	}).Preload("Category").Where("id = ?", id)

	// Se NÃO for admin, aplica o filtro de status
	if !checkIsAdmin(c) {
		query = query.Where("status IN ?", []models.Status{models.Available, models.Sold})
	}
	// Se for admin, o query continua sem filtro de status (vê tudo)

	if err := query.First(&listing).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		return
	}

	c.JSON(http.StatusOK, listing)
}

func GetListingBySlug(c *gin.Context) {
	slug := c.Param("slug")

	var listing models.Listing

	query := database.DB.Preload("User", func(db *gorm.DB) *gorm.DB {
		return db.Select(publicUserFields)
	}).Preload("Category").Where("slug = ?", slug)

	// Se NÃO for admin, aplica o filtro de status
	if !checkIsAdmin(c) {
		query = query.Where("status IN ?", []models.Status{models.Available, models.Sold})
	}
	// Se for admin, o query continua sem filtro de status (vê tudo)

	if err := query.First(&listing).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		return
	}

	c.JSON(http.StatusOK, listing)
}

func GetListingsByUser(c *gin.Context) {
	userSlug := c.Param("user_slug")

	var user models.User
	if err := database.DB.Where("slug = ?", userSlug).First(&user).Error; err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		}
		return
	}

	var listings []models.Listing
	if err := database.DB.Preload("User", func(db *gorm.DB) *gorm.DB {
		return db.Select(publicUserFields)
	}).Preload("Category").Where("user_id = ? AND status = ?", user.ID, models.Available).Find(&listings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve listings for user"})
		return
	}

	c.JSON(http.StatusOK, listings)
}

func UpdateListing(c *gin.Context) {
	user, _ := c.Get("currentUser")
	CurrentUser := user.(models.User)

	id := c.Param("id")

	// Search for the existing listing by ID
	var existing models.Listing
	if err := database.DB.First(&existing, "id = ?", id).Error; err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve listing"})
		}
		return
	}

	// Check if the listing is the logged user's listing
	if existing.UserID != CurrentUser.ID {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Cannot update another user's listing"})
		return
	}

	// Bind JSON to a map[string]interface{} to handle zero values correctly
	var updatesMap map[string]interface{}
	if err := c.ShouldBindJSON(&updatesMap); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Updates the slug if the title is provided
	if title, ok := updatesMap["title"].(string); ok && title != "" {
		if len(title) > 100 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Title too long"})
			return
		}
	}

	// Check if the description is below the maximum
	if description, ok := updatesMap["description"].(string); ok && description != "" {
		if len(description) > 1000 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Description too long"})
			return
		}
	}

	if categoryIDFloat, ok := updatesMap["category_id"].(float64); ok {
		categoryID := int(categoryIDFloat)
		if categoryID != existing.CategoryID {
			var category models.Category
			if err := database.DB.First(&category, "id = ?", categoryID).Error; err != nil {
				if err.Error() == "record not found" {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid CategoryID"})
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve category"})
				}
				return
			}
		}
	}

	// Use the existing listing as a base and apply updates
	if err := database.DB.Model(&existing).Updates(updatesMap).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update listing"})
		return
	}

	// Loading related data after the update
	if err := database.DB.Preload("User", func(db *gorm.DB) *gorm.DB {
		return db.Select(publicUserFields)
	}).Preload("Category").First(&existing, "id = ?", existing.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load related data"})
		return
	}

	// Return the updated listing
	c.JSON(http.StatusOK, existing)
}

func DeleteListing(c *gin.Context) {
	user, _ := c.Get("currentUser")
	CurrentUser := user.(models.User)

	id := c.Param("id")

	var listing models.Listing
	// 1. Busca o anúncio
	if err := database.DB.First(&listing, "id = ?", id).Error; err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve listing"})
		}
		return
	}

	// 2. Verifica se o usuário é o dono
	if listing.UserID != CurrentUser.ID {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Cannot delete another user's listing"})
		return
	}

	// 3. Em vez de deletar, atualiza o status para 'deleted'
	if err := database.DB.Model(&listing).Update("status", models.Deleted).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete listing"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Listing deleted successfully"})
}

func DeleteListingByAdmin(c *gin.Context) {
	id := c.Param("id")

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		var listing models.Listing
		if err := tx.First(&listing, "id = ?", id).Error; err != nil {
			return err
		}

		if err := tx.Where("listing_id = ?", id).Delete(&models.ListingImage{}).Error; err != nil {
			return err
		}
		if err := tx.Where("listing_id = ?", id).Delete(&models.Favorite{}).Error; err != nil {
			return err
		}

		if err := tx.Delete(&models.Listing{}, "id = ?", id).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete listing by admin", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Listing deleted successfully by admin"})
}
