package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
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
	fmt.Println("Connected to the database successfully")
}
