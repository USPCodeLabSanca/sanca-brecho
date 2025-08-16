package models

import (
	"time"

	"github.com/google/uuid"
)

type ReportReason string

const (
	FraudeGolpe       ReportReason = "fraude_golpe"
	Proibido          ReportReason = "proibido"
	InformacoesFalsas ReportReason = "info_falsa"
	Outro             ReportReason = "outro"
)

type ReportStatus string

const (
	StatusOpen     ReportStatus = "open"
	StatusResolved ReportStatus = "resolved"
	StatusRejected ReportStatus = "rejected"
)

type ReportTargetType string

const (
	TargetTypeProduct ReportTargetType = "product"
	TargetTypeUser    ReportTargetType = "user"
)

type Report struct {
	ID         uuid.UUID        `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	ReporterID string           `json:"reporter_id" gorm:"not null"`
	Reporter   User             `json:"reporter" gorm:"foreignKey:ReporterID;references:ID"`
	TargetType ReportTargetType `gorm:"type:report_target_type_enum;not null" json:"target_type"`
	TargetID   string           `json:"target_id" gorm:"not null"`
	Reason     ReportReason     `gorm:"type:report_reason_enum;not null" json:"reason"`
	Details    string           `gorm:"type:text" json:"details,omitempty"`
	Status     ReportStatus     `gorm:"type:report_status_enum;default:'open'" json:"status"`
	ResolvedAt *time.Time       `json:"resolved_at,omitempty"`
	CreatedAt  time.Time        `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt  time.Time        `json:"updated_at" gorm:"autoUpdateTime"`
}
