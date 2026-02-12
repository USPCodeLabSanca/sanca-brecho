package handler

import (
	"api/internal/models"
	database "api/internal/repository"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetDashboardStats(c *gin.Context) {
	var totalUsers int64
	var activeListings int64
	var listingsSold int64
	var pendingReports int64

	// Conta o total de usuários
	if err := database.DB.Model(&models.User{}).Count(&totalUsers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count users"})
		return
	}

	// Conta os anúncios ativos
	if err := database.DB.Model(&models.Listing{}).Where("status = ?", models.Available).Count(&activeListings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count active listings"})
		return
	}
	// Conta os anúncios vendidos
	if err := database.DB.Model(&models.Listing{}).Where("status = ?", models.Sold).Count(&listingsSold).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count sold listings"})
		return
	}

	// Conta as denúncias pendentes
	if err := database.DB.Model(&models.Report{}).Where("status = ?", "open").Count(&pendingReports).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count reports"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"totalUsers":     totalUsers,
		"activeListings": activeListings,
		"listingsSold":   listingsSold,
		"pendingReports": pendingReports,
	})
}
