package models

import (
	"time"

	"github.com/google/uuid"
)

type Sale struct {
	ID         uuid.UUID `json:"id" gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	ListingID  uuid.UUID `json:"listing_id" gorm:"not null;unique"`
	Listing    Listing   `json:"listing"`
	SellerID   string    `json:"seller_id" gorm:"not null"`
	Seller     User      `json:"seller" gorm:"foreignKey:SellerID;references:ID"`
	BuyerID    *string   `json:"buyer_id"`
	Buyer      User      `json:"buyer" gorm:"foreignKey:BuyerID;references:ID"`
	SoldAt     time.Time `json:"sold_at" gorm:"not null;autoCreateTime"`
	FinalPrice float64   `json:"final_price"`
	Review     *Review   `json:"review,omitempty"`
}
