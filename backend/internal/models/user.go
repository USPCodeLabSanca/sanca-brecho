package models

import (
	"fmt"
	"time"

	"github.com/gosimple/slug"
	"gorm.io/gorm"
)

type UserRole string

const (
	RoleUser  UserRole = "user"
	RoleAdmin UserRole = "admin"
)

type User struct {
	ID            string    `gorm:"primary_key"` // UUID firebase
	DisplayName   string    `json:"display_name" gorm:"not null"`
	Slug          string    `json:"slug" gorm:"uniqueIndex"`
	Email         string    `json:"email" gorm:"not null;uniqueIndex"`
	PhotoURL      *string   `json:"photo_url"`
	University    *string   `json:"university"`
	Whatsapp      *string   `json:"whatsapp"`
	Telegram      *string   `json:"telegram"`
	Verified      bool      `json:"verified" gorm:"default:false"`
	Role          UserRole  `json:"role" gorm:"default:user"`
	SalesAsBuyer  []Sale    `json:"-" gorm:"foreignKey:SellerID"`
	SalesAsSeller []Sale    `json:"-" gorm:"foreignKey:BuyerID"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	// Build the “base” slug from the display name
	base := slug.Make(u.DisplayName)
	candidate := base

	// Check for collisions, appending “-2”, “-3”, ... until unique
	var count int64
	for i := 1; ; i++ {
		tx.Model(&User{}).
			Where("slug = ?", candidate).
			Count(&count)

		if count == 0 {
			// no collision
			u.Slug = candidate
			break
		}
		// collision: try with suffix
		candidate = fmt.Sprintf("%s-%d", base, i+1)
	}
	return nil
}
