package repository

import (
	"api/internal/models"
	"log"
)

func Migrate() {
	var err error

	ennableUUIDExtension()
	createConditionEnum()
	createReportEnums()
	createStatusEnum()

	err = DB.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Listing{},
		&models.ListingImage{},
		&models.Favorite{},
		&models.Report{},
		&models.Sale{},
		&models.Review{},
	)

	createListingsIndexes()

	if err != nil {
		log.Fatal("Failed to migrate User model: ", err)
	}

	enableTSVectorSearchColumn() // shoud be called after all table alters (probably)
	crateTSIndex()               // deixando tudo mai rapidop

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

// Create the enum types for the Report model
func createReportEnums() {
	if err := DB.Exec(`
		DO $$
		BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_reason_enum') THEN
				CREATE TYPE report_reason_enum AS ENUM ('fraude_golpe', 'proibido', 'info_falsa', 'outro');
			END IF;
			IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status_enum') THEN
				CREATE TYPE report_status_enum AS ENUM ('open', 'resolved', 'rejected');
			END IF;
			IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_target_type_enum') THEN
				CREATE TYPE report_target_type_enum AS ENUM ('product', 'user');
			END IF;
		END$$;
	`).Error; err != nil {
		log.Fatal("❌ Failed to create report enum types:", err)
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

func enableTSVectorSearchColumn() {
	err := DB.Exec(`
		ALTER TABLE listings
		ADD COLUMN IF NOT EXISTS title_search tsvector
		GENERATED ALWAYS AS (
			setweight(to_tsvector('simple', coalesce(title, '')), 'A') || ' ' ||
			setweight(to_tsvector('simple', coalesce(keywords, '')), 'B') :: tsvector
		) stored;
 	`).Error

	if err != nil {
		log.Fatal("❌ Failed to generate tsvector auxiliary data: ", err)
	}
}

func crateTSIndex() {
	err := DB.Exec(`
		CREATE INDEX IF NOT EXISTS idx_search ON listings USING GIN(title_search);
 	`).Error

	if err != nil {
		log.Fatal("❌ Failed to generate index for ts vector: ", err)
	}
}