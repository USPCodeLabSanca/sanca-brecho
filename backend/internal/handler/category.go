package handler

import (
	"api/internal/models"
	"api/internal/repository"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateCategory(c *gin.Context) {
	var cat models.Category
	if err := c.ShouldBindJSON(&cat); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := repository.DB.Create(&cat).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
		return
	}

	c.JSON(http.StatusCreated, cat)
}

func GetCategory(c *gin.Context) {
	id := c.Param("id")
	var cat models.Category
	if err := repository.DB.First(&cat, "id = ?", id).Error; err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve category"})
		}
		return
	}

	c.JSON(http.StatusOK, cat)
}

func GetCategories(c *gin.Context) {
	var cats []models.Category
	if err := repository.DB.Find(&cats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve categories"})
		return
	}

	c.JSON(http.StatusOK, cats)
}

func UpdateCategory(c *gin.Context) {
	id := c.Param("id")
	var cat models.Category
	if err := repository.DB.First(&cat, "id = ?", id).Error; err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve category"})
		}
		return
	}

	var updates models.Category
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := repository.DB.Model(&cat).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update category"})
		return
	}

	c.JSON(http.StatusOK, cat)
}

func DeleteCategory(c *gin.Context) {
	id := c.Param("id")
	result := repository.DB.Delete(&models.Category{}, "id = ?", id)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Category deleted"})
}
