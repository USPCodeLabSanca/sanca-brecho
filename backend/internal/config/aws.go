package config

// snippet-start:[gov2.s3.Presigner.complete]
// snippet-start:[gov2.Presigner.struct]

import (
	"context"
	"log"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// Presigner encapsulates the Amazon Simple Storage Service (Amazon S3) presign actions
// used in the examples.
// It contains PresignClient, a client that is used to presign requests to Amazon S3.
// Presigned requests contain temporary credentials and can be made from any HTTP client.
var (
	AwsRegion     = "us-east-1"
	BucketName    = "my-app-uploads"
	PresignClient *s3.PresignClient
)

func InitAwsPresignClient() {
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion(AwsRegion))
	if err != nil {
		log.Fatalf("unable to load AWS SDK config, %v", err)
	}

	s3Client := s3.NewFromConfig(cfg)
	PresignClient = s3.NewPresignClient(s3Client)
}
