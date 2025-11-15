package models

import "time"

// Public data
type Profile struct {
	DisplayName string    `json:"display_name"`
	Slug        string    `json:"slug"`
	PhotoURL    *string   `json:"photo_url"`
	University  *string   `json:"university"`
	Verified    bool      `json:"verified"`
	CreatedAt   time.Time `json:"created_at"`
	Role        UserRole  `json:"role"`
}
