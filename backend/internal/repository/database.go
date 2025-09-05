package repository

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"api/internal/models"
)

var DB *gorm.DB

func Connect() {
	// define the connection
	dns := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	// connect to the database
	db, err := gorm.Open(postgres.Open(dns), &gorm.Config{})
	if err != nil {
		fmt.Println("Error connecting to the database: ", err)
		return
	}

	// setting the DB variable
	sqlDB, err := db.DB()

	if err != nil {
		log.Fatal(err)
	}

	sqlDB.SetMaxOpenConns(10)           // set the maximum number of open connections to the database
	sqlDB.SetMaxIdleConns(5)            // set the maximum number of idle connections in the pool
	sqlDB.SetConnMaxLifetime(time.Hour) // set the maximum amount of time a connection may be reused

	DB = db

	log.Println("✅ Database connected successfully")
}

func SearchListingsFTS(query string, page, pageSize int) ([]models.Listing, error) {
	var ids []uuid.UUID
	sql := `
		SELECT id
		FROM listings
		WHERE status = 'available'
			AND title_search @@ websearch_to_tsquery(?)
		ORDER BY ts_rank(title_search, websearch_to_tsquery(?)) DESC
		LIMIT ? OFFSET ?
		`

	err := DB.Raw(sql, query, query, pageSize, (page-1)*pageSize).Scan(&ids).Error
	if err != nil {
		log.Fatal("❌ Failed to scan listings using fts: ", err)
		return nil, err
	}

	var listings []models.Listing
	if len(ids) > 0 {
		DB.Preload("User").Preload("Category").Find(&listings, "id IN ?", ids)
	}

	return listings, nil
}
