package models

import "time"

type SellerMetrics struct {
	IsVerified          bool       `json:"is_verified"`
	ActiveListingsCount int64      `json:"active_listings_count"`
	ProfileIsComplete   bool       `json:"profile_is_complete"`
	ItemsSold           int64      `json:"items_sold"`
	TotalListingsCount  int64      `json:"total_listings_count"`
	TotalFavoritesCount int64      `json:"total_favorites_count"`
	MemberSince         *time.Time `json:"member_since"`
}
