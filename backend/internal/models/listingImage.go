package models

import "github.com/google/uuid"

type ListingImage struct {
	ID        uuid.UUID `json:"id" gorm:"type: uuid;default:uuid_generate_v4();primary_key"`
	ListingID uuid.UUID `json:"listing_id" gorm:"type:uuid;not null"`
	Listing   Listing   `json:"listing" gorm:"foreignKey:ListingID;references:ID"`
	Src       string    `json:"src" gorm:"not null"`
	IsPrimary bool      `json:"is_primary" gorm:"default:false"`
}
