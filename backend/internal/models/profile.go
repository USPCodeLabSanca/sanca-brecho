package models

// Public data
type Profile struct {
	DisplayName string   `json:"display_name"`
	Slug        string   `json:"slug"`
	Email       string   `json:"email"`
	PhotoURL    *string  `json:"photo_url"`
	University  *string  `json:"university"`
	Whatsapp    *string  `json:"whatsapp"`
	Telegram    *string  `json:"telegram"`
	Verified    bool     `json:"verified"`
	Role        UserRole `json:"role"`
}
