package models

import (
    "time"
    "github.com/google/uuid"
)

type Review struct {
    ID        uuid.UUID `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
    SaleID    uuid.UUID `json:"sale_id" gorm:"not null;unique"`
    Rating    int       `json:"rating" gorm:"not null"`
    Comment   string    `json:"comment"`
    CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
}