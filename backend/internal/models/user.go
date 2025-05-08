package models

import (
	"time"
)

type User struct {
	ID          string  `gorm:"primary_key"` // UUID firebase
	DisplayName string  `json:"display_name" gorm:"not null"`
	Email       string  `json:"email" gorm:"not null;uniqueIndex"`
	PhotoURL    *string `json:"photo_url"`
	University  *string `json:"university"`
	Whatsapp    *string `json:"whatsapp"`
	Telegram    *string `json:"telegram"`
	Verified    bool    `json:"verified" gorm:"default:false"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
