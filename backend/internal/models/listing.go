package models

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/gosimple/slug"
	"gorm.io/gorm"
)

type Condition string

const (
	New         Condition = "new"
	Used        Condition = "used"
	Refurbished Condition = "refurbished"
	Broken      Condition = "broken"
)

type Status string

const (
	Available Status = "available"
	Sold      Status = "sold"
)

type Listing struct {
	ID               uuid.UUID `json:"id" gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	UserID           string    `json:"user_id" gorm:"not null"` // string, compatível com ID do Firebase
	User             User      `json:"user" gorm:"foreignKey:UserID;references:ID"`
	CategoryID       int       `json:"category_id" gorm:"not null"`
	Category         Category  `json:"category" gorm:"foreignKey:CategoryID;references:ID"`
	Title            string    `json:"title" gorm:"not null"`
	Keywords         string    `json:"keywords" gorm:"not null"` // sequencia de palavra chaves separadas por espaço (string paddrao. ex: celular iphone telefone)
	Slug             string    `json:"slug" gorm:"not null;uniqueIndex"`
	Description      string    `json:"description" gorm:"not null"`
	Price            float64   `json:"price" gorm:"not null"`
	Condition        Condition `json:"condition" gorm:"type:condition_enum;not null"`
	IsNegotiable     bool      `json:"is_negotiable" gorm:"not null"`
	SellerCanDeliver bool      `json:"seller_can_deliver" gorm:"not null"`
	Location         string    `json:"location" gorm:"not null"`
	Status           Status    `json:"status" gorm:"type:status_enum;not null;default:available"`
	Sale             *Sale     `json:"sale"`
	CreatedAt        time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt        time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (l *Listing) BeforeCreate(tx *gorm.DB) (err error) {
	// Build the “base” slug from the title
	base := slug.Make(l.Title)
	candidate := base

	var count int64
	for i := 1; ; i++ {
		tx.Model(&Listing{}).
			Where("slug = ?", candidate).
			Count(&count)

		if count == 0 {
			// no collision
			l.Slug = candidate
			break
		}
		// collision: try with suffix
		candidate = fmt.Sprintf("%s-%d", base, i+1)
	}

	return nil
}
