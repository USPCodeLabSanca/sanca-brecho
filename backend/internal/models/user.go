package models

import (
	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primary_key"`
	Name      string    `json:"name" gorm:"not null"`
	Email     string    `json:"email" gorm:"not null;uniqueIndex"`
	Username  string    `json:"username" gorm:"not null;uniqueIndex"`
	Password  string    `json:"password" gorm:"not null"`
	Whatsapp  string    `json:"whatsapp"`
	Telegram  string    `json:"telegram"`
	CreatedAt string    `json:"created_at" gorm:"default.now()"`
	UpdatedAt string    `json:"updated_at" gorm:"default.now()"`
}
