package models

import (
	"time"

	"github.com/google/uuid"
)

type Condition string

const (
	New         Condition = "new"
	Used        Condition = "used"
	Refurbished Condition = "refurbished"
	Broken      Condition = "broken"
)

type Listing struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	UserID      string    `json:"user_id" gorm:"not null"` // string, compatível com ID do Firebase
	User        User      `json:"user" gorm:"foreignKey:UserID;references:ID"`
	CategoryID  int
	Category    Category  `json:"category" gorm:"foreignKey:CategoryID;references:ID"`
	Title       string    `json:"title" gorm:"not null"`
	Slug        string    `json:"slug" gorm:"not null;uniqueIndex"`
	Description string    `json:"description" gorm:"not null"`
	Price       float64   `json:"price" gorm:"not null"`
	Condition   Condition `json:"condition" gorm:"type:condition_enum;not null"`
	AcceptTrade bool      `json:"accept_trade" gorm:"not null"`
	Location    string    `json:"location" gorm:"not null"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}
