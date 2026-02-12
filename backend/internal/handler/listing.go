package handler

import (
	"api/internal/models"
	"errors"
	"net/http"
	"strconv"

	database "api/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var publicUserFields = "id, display_name, slug, photo_url, university, verified, role, created_at"

// paginationParams holds common pagination parameters
type paginationParams struct {
	Page     int
	PageSize int
	Offset   int
}

// parsePaginationParams parses and validates pagination query parameters.
// Returns paginationParams and an error message if validation fails.
func parsePaginationParams(c *gin.Context) (*paginationParams, string) {
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("pageSize", "20")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		return nil, "invalid `page` param"
	}

	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil || pageSize < 1 {
		return nil, "invalid `pageSize` param"
	}

	return &paginationParams{
		Page:     page,
		PageSize: pageSize,
		Offset:   (page - 1) * pageSize,
	}, ""
}

// parseCategoryParam parses and validates the category query parameter.
// Returns (categoryID, hasCategory, errorMessage, httpStatus).
func parseCategoryParam(c *gin.Context) (int, bool, string, int) {
	categoryStr := c.Query("category")
	if categoryStr == "" {
		return 0, false, "", 0
	}

	id, err := strconv.Atoi(categoryStr)
	if err != nil {
		return 0, false, "invalid `category` param", http.StatusBadRequest
	}

	var category models.Category
	if err := database.DB.First(&category, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, false, "Invalid CategoryID", http.StatusBadRequest
		}
		return 0, false, "Failed to retrieve category", http.StatusInternalServerError
	}

	return id, true, "", 0
}

// baseListingQuery returns a base query with common preloads for listing queries.
func baseListingQuery() *gorm.DB {
	return database.DB.
		Preload("User", func(db *gorm.DB) *gorm.DB {
			return db.Select(publicUserFields)
		}).
		Preload("Category")
}

// sendPaginatedResponse sends a standardized paginated response.
func sendPaginatedResponse(c *gin.Context, data interface{}, pagination *paginationParams, total int64) {
	c.JSON(http.StatusOK, gin.H{
		"data":     data,
		"page":     pagination.Page,
		"pageSize": pagination.PageSize,
		"total":    total,
	})
}

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
	// Parse pagination parameters
	pagination, errMsg := parsePaginationParams(c)
	if errMsg != "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": errMsg})
		return
	}

	// Parse category parameter
	categoryID, hasCategory, errMsg, status := parseCategoryParam(c)
	if errMsg != "" {
		c.JSON(status, gin.H{"error": errMsg})
		return
	}

	// Count total matching entries
	var total int64
	dbCount := database.DB.Model(&models.Listing{}).Where("status = ?", models.Available)
	if hasCategory {
		dbCount = dbCount.Where("category_id = ?", categoryID)
	}
	if err := dbCount.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count listings"})
		return
	}

	// Fetch paginated results
	var listings []models.Listing
	query := baseListingQuery().Where("status = ?", models.Available)

	if hasCategory {
		query = query.Where("category_id = ?", categoryID)
	}

	if err := query.
		Order("created_at desc, id desc").
		Limit(pagination.PageSize).
		Offset(pagination.Offset).
		Find(&listings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve listings"})
		return
	}

	sendPaginatedResponse(c, listings, pagination, total)
}

// query param is mandatory. page and pageSize are optional. page starts at 1.
// if page and pageSize are not provided, the default is 1 and 20 respectively.
func GetListingsSearch(c *gin.Context) {
	q := c.Query("q")
	if q == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing `q` param"})
		return
	}

	// Parse category parameter
	categoryID, hasCategory, errMsg, status := parseCategoryParam(c)
	if errMsg != "" {
		c.JSON(status, gin.H{"error": errMsg})
		return
	}

	// Parse pagination parameters
	pagination, errMsg := parsePaginationParams(c)
	if errMsg != "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": errMsg})
		return
	}

	likePattern := "%" + q + "%"

	// Count total matching entries with same filters
	var total int64
	dbCount := database.DB.Model(&models.Listing{}).Where("(title ILIKE ? OR description ILIKE ?)", likePattern, likePattern)
	if hasCategory {
		dbCount = dbCount.Where("category_id = ?", categoryID)
	}
	if !checkIsAdmin(c) {
		dbCount = dbCount.Where("status = ?", models.Available)
	}
	if err := dbCount.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count listings"})
		return
	}

	// Fetch paginated results with same filters
	var results []models.Listing
	query := baseListingQuery().Where("(title ILIKE ? OR description ILIKE ?)", likePattern, likePattern)

	if hasCategory {
		query = query.Where("category_id = ?", categoryID)
	}
	if !checkIsAdmin(c) {
		query = query.Where("status = ?", models.Available)
	}

	if err := query.
		Order("created_at desc, id desc").
		Limit(pagination.PageSize).
		Offset(pagination.Offset).
		Find(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve listings"})
		return
	}

	if results == nil {
		results = []models.Listing{}
	}

	sendPaginatedResponse(c, results, pagination, total)
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

func GetListingsAdmin(c *gin.Context) {
	pagination, errMsg := parsePaginationParams(c)
	if errMsg != "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": errMsg})
		return
	}

	var total int64
	if err := database.DB.Model(&models.Listing{}).Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count listings"})
		return
	}
	var listings []models.Listing
	if err := baseListingQuery().
		Order("created_at desc, id desc").
		Limit(pagination.PageSize).
		Offset(pagination.Offset).
		Find(&listings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve listings"})
		return
	}

	sendPaginatedResponse(c, listings, pagination, total)
}

func UpdateListingStatusByAdmin(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Status models.Status `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var listing models.Listing
	if err := database.DB.First(&listing, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		return
	}

	if err := database.DB.Model(&listing).Update("status", input.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update listing status"})
		return
	}

	database.DB.First(&listing, "id = ?", id)
	c.JSON(http.StatusOK, listing)
}
