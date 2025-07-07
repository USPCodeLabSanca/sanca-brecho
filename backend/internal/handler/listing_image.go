package handler

import (
	"api/internal/config"
	"api/internal/models"
	"api/internal/repository"
	"context"
	"fmt"
	"log"
	"net/http"
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
	if err := repository.DB.Preload("Listing.User").Preload("Listing.Category").First(&img, "id = ?", img.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load related data"})
		return
	}

	// Retornar o objeto criado com os dados relacionados
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

	// Buscar todas as imagens relacionadas ao ListingID
	if err := repository.DB.Where("listing_id = ?", listingID).Find(&images).Error; err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "No images found for the specified listing"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve images"})
		}
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
	id := c.Param("id")
	var existing models.ListingImage

	// Buscar a imagem existente
	if err := repository.DB.First(&existing, "id = ?", id).Error; err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve image"})
		}
		return
	}

	// Bind JSON para os updates
	var update models.ListingImage
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validar se o ListingID foi alterado e existe
	if update.ListingID != uuid.Nil && update.ListingID != existing.ListingID {
		var listing models.Listing
		if err := repository.DB.First(&listing, "id = ?", update.ListingID).Error; err != nil {
			if err.Error() == "record not found" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ListingID"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve listing"})
			}
			return
		}
	}

	// Atualizar a imagem no banco de dados
	if err := repository.DB.Model(&existing).Updates(update).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update image"})
		return
	}

	// Carregar os dados relacionados (Listing, User e Category) após a atualização
	if err := repository.DB.Preload("Listing.User").Preload("Listing.Category").First(&existing, "id = ?", existing.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load related data"})
		return
	}

	// Retornar a imagem atualizada com os dados relacionados
	c.JSON(http.StatusOK, existing)
}

func DeleteListingImage(c *gin.Context) {
	id := c.Param("id")
	if err := repository.DB.Delete(&models.ListingImage{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete image"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Image deleted"})
}
