package repository

import (
	"api/internal/models"
	"log"
)

func Migrate() {
	var err error

	ennableUUIDExtension()
	createConditionEnum()
	createStatusEnum()

	err = DB.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Listing{},
		&models.ListingImage{},
		&models.Favorite{},
		&models.Sale{},
		&models.Review{},
	)

	createListingsIndexes()

	if err != nil {
		log.Fatal("Failed to migrate User model: ", err)
	}

	log.Println("✅ Database migrated successfully")
}

// Enable the uuid-ossp extension for UUID generation
func ennableUUIDExtension() {
	err := DB.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`).Error
	if err != nil {
		log.Fatal("Failed to enable uuid-ossp extension: ", err)
	}
}

// Create the condition_enum type if it doesn't exist
func createConditionEnum() {
	err := DB.Exec(`
		DO $$
		BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'condition_enum') THEN
				CREATE TYPE condition_enum AS ENUM ('new', 'used', 'refurbished', 'broken');
			END IF;
		END$$;
	`).Error
	if err != nil {
		log.Fatal("❌ Failed to create enum condition_enum:", err)
	}
}

func createStatusEnum() {
	err := DB.Exec(`
		DO $$
		BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_enum') THEN
				CREATE TYPE status_enum AS ENUM ('available', 'sold');
			END IF;
		END$$;
	`).Error
	if err != nil {
		log.Fatal("❌ Failed to create enum status_enum:", err)
	}
}

func createListingsIndexes() {
	DB.Exec(`CREATE INDEX IF NOT EXISTS idx_listings_status ON listings (status)`)
	DB.Exec(`CREATE INDEX IF NOT EXISTS idx_listings_search ON listings (category_id, price, created_at DESC)`)
}
