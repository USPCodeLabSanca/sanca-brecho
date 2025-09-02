package repository

import (
	"fmt"
	"log"
	"os"
	"time"

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


func SearchListingsFTS(query string) ([]models.Listing, error) {
	var results []models.Listing

	sql := `
	SELECT *
	FROM listings
	WHERE title_search @@ websearch_to_tsquery(?)
	`

	err := DB.Raw(sql, query).Scan(&results).Error
    if err != nil {
		log.Fatal("❌ Failed to scan listings using fts: ", err)
        return nil, err
    }
    
	log.Println("✅ Fts Scan complete")

    return results, nil
}
