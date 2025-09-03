package handler

import (
	"api/internal/config"
	"api/internal/models"
	"api/internal/repository"
	"context"
	"fmt"
	"log"
	"net/http"
	"slices"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Handler: returns a presigned URL for uploading a single object
type PresignRequest struct {
	Filename    string `json:"filename"`    // e.g. "avatar.png" or "images/2025/06/04/foo.jpg"
	ContentType string `json:"contentType"` // e.g. "image/png"
}

type PresignResponse struct {
	URL       string `json:"url"`       // the presigned PUT URL
	PublicURL string `json:"publicURL"` // how your app will reference this object (e.g. https://bucket.s3.amazonaws.com/key)
	Key       string `json:"key"`       // the S3 key you asked for
}

func GeneratePresignedURL(c *gin.Context) {
	var req PresignRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON"})
		return
	}

	// Validate the Content-Type
	allowed := []string{"image/png", "image/jpeg", "image/jpg"}
	if req.ContentType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Content-Type header is required"})
		return
	}

	valid := slices.Contains(allowed, req.ContentType)
	if !valid {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Content-Type must be one of: %v", allowed)})
		return
	}

	// Start building the presigned URL request
	// S3 Key will be a UUID, which is a unique identifier for the object
	key := uuid.New().String()

	// Build the PutObjectInput
	input := &s3.PutObjectInput{
		Bucket:      aws.String(config.BucketName),
		Key:         aws.String(key),
		ContentType: aws.String(req.ContentType),
	}

	// Ask the presignClient to generate a presigned URL for 15 minutes
	presignedReq, err := config.PresignClient.PresignPutObject(context.TODO(), input,
		s3.WithPresignExpires(15*time.Minute),
	)

	if err != nil {
		log.Printf("presign error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate presigned URL"})
		return
	}

	// Build the public URL
	publicURL := fmt.Sprintf("https://%s.s3.amazonaws.com/%s", config.BucketName, key)

	c.JSON(http.StatusOK, PresignResponse{
		URL:       presignedReq.URL,
		PublicURL: publicURL,
		Key:       key,
	})
}

func CreateListingImage(c *gin.Context) {
	var img models.ListingImage

	// Bind JSON para o objeto ListingImage
	if err := c.ShouldBindJSON(&img); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Gerar UUID para o ID
	img.ID = uuid.New()

	// Validar se o ListingID existe
	var listing models.Listing
	if err := repository.DB.First(&listing, "id = ?", img.ListingID).Error; err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ListingID"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve listing"})
		}
		return
	}

	// Criar o ListingImage no banco de dados
	if err := repository.DB.Create(&img).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create image"})
		return
	}

	// Carregar os dados relacionados (Listing, User e Category) após a criação
	// Retornar o objeto criado
	c.JSON(http.StatusCreated, img)
}

func GetListingImage(c *gin.Context) {
	id := c.Param("id")
	var img models.ListingImage

	if err := repository.DB.First(&img, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	c.JSON(http.StatusOK, img)
}

func GetListingImagesByListing(c *gin.Context) {
	listingID := c.Param("listingID")
	var images []models.ListingImage

	if err := repository.DB.Where("listing_id = ?", listingID).Order("\"order\" asc").Find(&images).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve images"})
		return
	}

	c.JSON(http.StatusOK, images)
}

func GetListingImages(c *gin.Context) {
	var images []models.ListingImage

	if err := repository.DB.Find(&images).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve images"})
		return
	}

	c.JSON(http.StatusOK, images)
}

func UpdateListingImage(c *gin.Context) {
	user, _ := c.Get("currentUser")
	CurrentUser := user.(models.User)

	id := c.Param("id")
	var existing models.ListingImage

	// Buscar a imagem existente
	if err := repository.DB.First(&existing, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	// Check if the listing is the user's listing
	var listing models.Listing
	if err := repository.DB.First(&listing, "id = ?", existing.ListingID).Error; err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve listing from listing image"})
		}
		return
	}

	if listing.UserID != CurrentUser.ID {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Cannot update another user's listing"})
		return
	}

	var updates map[string]any
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := repository.DB.Model(&existing).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update image"})
		return
	}

	c.JSON(http.StatusOK, existing)
}

func DeleteListingImage(c *gin.Context) {
	user, _ := c.Get("currentUser")
	CurrentUser := user.(models.User)

	id := c.Param("id")

	// Get the listing ID from the listing image id
	var listingImage models.ListingImage
	if err := repository.DB.First(&listingImage, "id = ?", id).Error; err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve listing image"})
		}
		return
	}

	// Check if the listing is the user's listing
	var listing models.Listing
	if err := repository.DB.First(&listing, "id = ?", listingImage.ListingID).Error; err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve listing from image"})
		}
		return
	}

	if listing.UserID != CurrentUser.ID {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Cannot delete another user's listing"})
		return
	}

	if err := repository.DB.Delete(&listingImage).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete image"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Image deleted"})
}
