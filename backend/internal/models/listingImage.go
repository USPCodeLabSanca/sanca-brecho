package models

import "github.com/google/uuid"

type ListingImage struct {
	ID        uuid.UUID `json:"id" gorm:"type: uuid;default:uuid_generate_v4();primary_key"`
	ListingID uuid.UUID `json:"listing_id" gorm:"type:uuid;not null"`
	Listing   Listing   `json:"listing" gorm:"foreignKey:ListingID;references:ID"`
	Src       string    `json:"src" gorm:"not null"`
	Order     int       `json:"order" gorm:"default:0"`
	Key       string    `json:"key" gorm:"not null"`
}
