package models

type Favorite struct {
	UserID    string  `json:"user_id" gorm:"type:uuid;primaryKey"`
	User      User    `json:"user" gorm:"foreignKey:UserID;references:ID"`
	ListingID string  `json:"listing_id" gorm:"type:uuid;primaryKey"`
	Listing   Listing `json:"listing" gorm:"foreignKey:ListingID;references:ID"`

	CreatedAt string `json:"created_at" gorm:"default.now()"`
}
