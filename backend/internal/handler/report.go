package handler

import (
	"api/internal/models"
	"api/internal/repository"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// CreateReport faz a criação de uma denúncia
func CreateReport(c *gin.Context) {
	user, _ := c.Get("currentUser")
	currentUser := user.(models.User)

	var report models.Report
	if err := c.ShouldBindJSON(&report); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	report.ReporterID = currentUser.ID

	if err := repository.DB.Create(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create report"})
		return
	}

	c.JSON(http.StatusCreated, report)
}

type PaginatedReportsResponse struct {
	Reports  []ReportResponse `json:"reports"`
	Total    int64            `json:"total"`
	Page     int              `json:"page"`
	PageSize int              `json:"pageSize"`
}

type ReportResponse struct {
	models.Report
	TargetName string `json:"target_name"`
	TargetSlug string `json:"target_slug"`
}

// GetReports recupera todas as denúncias com paginação e filtro por status
func GetReports(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	status := c.Query("status") // 'open' ou 'closed'

	offset := (page - 1) * pageSize

	var reports []models.Report
	var total int64

	query := repository.DB.Preload("Reporter")

	// Lógica de filtro (procura todos se status não for especificado)
	if status == "open" {
		query = query.Where("status = ?", "open")
	} else if status == "closed" {
		query = query.Where("status IN ?", []string{"resolved", "rejected"})
	}

	query.Model(&models.Report{}).Count(&total)

	err := query.Order("created_at desc").Limit(pageSize).Offset(offset).Find(&reports).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve reports"})
		return
	}

	var detailedReports []ReportResponse
	for _, report := range reports {
		dr := ReportResponse{
			Report: report,
		}

		if report.TargetType == models.TargetTypeProduct {
			var listing struct {
				Title string
				Slug  string
			}
			repository.DB.Model(&models.Listing{}).Where("id = ?", report.TargetID).First(&listing)
			dr.TargetName = listing.Title
			dr.TargetSlug = listing.Slug
		} else if report.TargetType == models.TargetTypeUser {
			var user struct {
				DisplayName string
				Slug        string
			}
			repository.DB.Model(&models.User{}).Where("slug = ?", report.TargetID).First(&user)
			dr.TargetName = user.DisplayName
			dr.TargetSlug = user.Slug
		}
		detailedReports = append(detailedReports, dr)
	}

	c.JSON(http.StatusOK, PaginatedReportsResponse{
		Reports:  detailedReports,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	})
}

// GetReport recupera uma denúncia específica pelo ID
func GetReport(c *gin.Context) {
	id := c.Param("id")
	var report models.Report
	if err := repository.DB.Preload("Reporter").First(&report, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		return
	}

	c.JSON(http.StatusOK, report)
}

// UpdateReportStatus atualiza o status de uma denúncia
func UpdateReportStatus(c *gin.Context) {
	id := c.Param("id")
	var report models.Report
	if err := repository.DB.First(&report, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		return
	}

	var request struct {
		Status models.ReportStatus `json:"status"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
		return
	}

	report.Status = request.Status
	now := time.Now()
	report.ResolvedAt = &now

	if err := repository.DB.Save(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update report status"})
		return
	}

	c.JSON(http.StatusOK, report)
}
