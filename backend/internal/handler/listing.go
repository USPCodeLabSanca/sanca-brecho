package handler

import (
	"api/internal/models"
	"api/internal/repository"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gosimple/slug"

	database "api/internal/repository"
)

func CreateListing(c *gin.Context) {
	var listing models.Listing

	if err := c.ShouldBindJSON(&listing); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	//generate UUID for the listing ID
	listing.ID = uuid.New()
	//set the slug
	listing.Slug = slug.Make(listing.Title)
	//setting the active status to true
	listing.IsActive = true

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
	if err := database.DB.Preload("User").Preload("Category").First(&listing, "id = ?", listing.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load related data"})
		return
	}

	c.JSON(http.StatusCreated, listing)
}

func GetListings(c *gin.Context) {
	var listings []models.Listing

	if err := database.DB.Preload("User").Preload("Category").Find(&listings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve listings"})
		return
	}

	c.JSON(http.StatusOK, listings)
}

func GetListingsSearch( c *gin.Context) {
	query, ok := c.Params.Get("query")
	if !ok {
		c.JSON(http.StatusBadRequest,  gin.H{"message" : "missing `query` param"})
	}

	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message" : "missing `query` param"})
		return
	}

	// do query here
	result, err := repository.SearchListingsFTS(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal error"})
		return
	}

	if len(result) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No items match this query"})
		return
	}

	c.JSON(http.StatusOK, result)
}

func GetListing(c *gin.Context) {
	id := c.Param("id")

	var listing models.Listing

	if err := database.DB.Preload("User").Preload("Category").First(&listing, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
	}

	c.JSON(http.StatusOK, listing)
}

func GetListingBySlug(c *gin.Context) {
	slug := c.Param("slug")

	var listing models.Listing

	if err := database.DB.Preload("User").Preload("Category").First(&listing, "slug = ?", slug).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
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
	if err := database.DB.Preload("User").Preload("Category").Where("user_id = ?", user.ID).Find(&listings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve listings for user"})
		return
	}

	c.JSON(http.StatusOK, listings)
}

func UpdateListing(c *gin.Context) {
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

	// Bind JSON to a map[string]interface{} to handle zero values correctly
	var updatesMap map[string]interface{}
	if err := c.ShouldBindJSON(&updatesMap); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Updates the slug if the title is provided
	if title, ok := updatesMap["title"].(string); ok && title != "" {
		updatesMap["slug"] = slug.Make(title)
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
	if err := database.DB.Preload("User").Preload("Category").First(&existing, "id = ?", existing.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load related data"})
		return
	}

	// Return the updated listing
	c.JSON(http.StatusOK, existing)
}

func DeleteListing(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Listing{}, "id=?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete listing"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"messa": "Listing deleted successfully"})
}
