package models

type Category struct {
	ID       int         `json:"id" gorm:"primaryKey;autoIncrement"`
	Name     string      `json:"name" gorm:"not null"`
	ParentID *int        `json:"parent_id" gorm:"default:null"`
	Parent   *Category   `json:"parent" gorm:"foreignKey:ParentID;references:ID"`
	Children []*Category `json:"children" gorm:"foreignKey:ParentID;references:ID"`
}
