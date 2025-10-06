package config

import (
	"api/internal/models"
	"api/internal/repository"
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// Presigner encapsulates the Amazon Simple Storage Service (Amazon S3) presign actions
// used in the examples.
// It contains PresignClient, a client that is used to presign requests to Amazon S3.
// Presigned requests contain temporary credentials and can be made from any HTTP client.
var (
	AwsRegion     = "us-east-2"
	BucketName    = os.Getenv("S3BUCKET")
	PresignClient *s3.PresignClient
	S3Client      *s3.Client
)

func InitAwsClients() {
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion(AwsRegion))
	if err != nil {
		log.Fatalf("unable to load AWS SDK config, %v", err)
	}

	S3Client = s3.NewFromConfig(cfg)
	PresignClient = s3.NewPresignClient(S3Client)
}

func CleanupS3AndDB() {
	// Not letting it run if the environment is not production
	if os.Getenv("ENVIRONMENT") != "production" {
		log.Println("⚠️ CleanupS3AndDB skipped: not in production environment")
		return
	}

	// 1. Get all image keys from DB
	var dbImages []models.ListingImage
	if err := repository.DB.Find(&dbImages).Error; err != nil {
		return
	}

	dbKeys := make(map[string]models.ListingImage)
	for _, img := range dbImages {
		dbKeys[img.Key] = img
	}

	// 2. List all objects in S3 bucket
	s3Objects := make(map[string]bool)
	paginator := s3.NewListObjectsV2Paginator(S3Client, &s3.ListObjectsV2Input{
		Bucket: aws.String(BucketName),
	})

	for paginator.HasMorePages() {
		page, err := paginator.NextPage(context.TODO())
		if err != nil {
			return
		}
		for _, obj := range page.Contents {
			s3Objects[*obj.Key] = true
		}
	}

	deletedFromS3 := []string{}
	deletedFromDB := []string{}

	// 3. Delete from S3 if not in DB
	for key := range s3Objects {
		if _, exists := dbKeys[key]; !exists {
			_, err := S3Client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
				Bucket: aws.String(BucketName),
				Key:    aws.String(key),
			})
			if err != nil {
				log.Printf("failed to delete %s from S3: %v", key, err)
			} else {
				deletedFromS3 = append(deletedFromS3, key)
			}
		}
	}

	// 4. Delete from DB if not in S3
	for key, img := range dbKeys {
		if _, exists := s3Objects[key]; !exists {
			if err := repository.DB.Delete(&img).Error; err != nil {
				log.Printf("failed to delete %s from DB: %v", key, err)
			} else {
				deletedFromDB = append(deletedFromDB, key)
			}
		}
	}

	fmt.Println(map[string]interface{}{
		"deleted_from_s3": deletedFromS3,
		"deleted_from_db": deletedFromDB,
	})
}
