package models

type ListingImage struct {
	ID        string  `json:"id" gorm:"type: uuid;default:uuid_generate_v4();primary_key"`
	ListingID string  `json:"listing_id" gorm:"type:uuid;not null"`
	Listing   Listing `json:"listing" gorm:"foreignKey:ListingID;references:ID"`
	Src       string  `json:"src" gorm:"not null"`
	IsPrimary bool    `json:"is_primary" gorm:"default:false"`
}
