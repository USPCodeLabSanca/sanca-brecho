package handler

// this file sohuld contain every entry-output type information
// regarding the api. we should not directly use the same data as the domain.Models
// since models is coupled to the database modeling


import "api/internal/models"

type ErrorResponse struct {
	Error string `json:"error"`
}

type UserResponse struct {
	User models.User `json:"user"`
}

type FindProfileOwnerResponse struct {
	IsOwner bool `json:"is_owner"`
}

type GetProfileMetricsResponse struct {
	Metrics models.SellerMetrics `json:"metrics"`
}