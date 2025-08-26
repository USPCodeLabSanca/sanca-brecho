package repository

import (
	"api/internal/models"
	"log"
)

func Migrate() {
	var err error

	ennableUUIDExtension()
	createConditionEnum()

	err = DB.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Listing{},
		&models.ListingImage{},
		&models.Favorite{},
	)

	if err != nil {
		log.Fatal("Failed to migrate User model: ", err)
	}

	enableTSVectorSearchColumn() // shoud be called after all table alters (probably)
	crateTSIndex() // deixando tudo mai rapidop

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

func enableTSVectorSearchColumn() {
	err := DB.Exec(`
		ALTER TABLE listings
		ADD title_search tsvector
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
		CREATE INDEX idx_search ON listings USING GIN(title_search);
 	`).Error

	if err != nil {
		log.Fatal("❌ Failed to generate index for ts vector: ", err)
	}
}