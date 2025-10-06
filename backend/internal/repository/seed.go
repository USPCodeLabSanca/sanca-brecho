package repository

import (
	"api/internal/models"
	"log"
	"os"

	"github.com/google/uuid"
	"github.com/gosimple/slug"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// Recebe uma string e retorna um ponteiro para string
func StringPtr(s string) *string {
	return &s
}

// Seed insere dados de demonstração de forma idempotente.
func Seed() error {
	if os.Getenv("ENVIRONMENT") != "development" {
		log.Println("⚠️ Seed skipped: not in development environment")
		return nil
	}

	return DB.Transaction(func(tx *gorm.DB) error {
		/* ------------------------------------------------------------------
		   1. Categorias
		------------------------------------------------------------------*/
		informatica := &models.Category{}
		if err := tx.FirstOrCreate(informatica, models.Category{Name: "Informática", Icon: "🧑‍💻"}).Error; err != nil {
			return err
		}

		notebooks := &models.Category{}
		if err := tx.Where(models.Category{Name: "Notebooks", ParentID: &informatica.ID}).
			FirstOrCreate(notebooks, models.Category{Name: "Notebooks", Icon: "💻", Parent: informatica}).Error; err != nil {
			return err
		}

		perifericos := &models.Category{}
		if err := tx.Where(models.Category{Name: "Periféricos", ParentID: &informatica.ID}).
			FirstOrCreate(perifericos, models.Category{Name: "Periféricos", Icon: "🖱️", Parent: informatica}).Error; err != nil {
			return err
		}

		eletronicos := &models.Category{}
		if err := tx.FirstOrCreate(eletronicos, models.Category{Name: "Eletrônicos", Icon: "🔌"}).Error; err != nil {
			return err
		}

		smartphones := &models.Category{}
		if err := tx.Where(models.Category{Name: "Smartphones", ParentID: &eletronicos.ID}).
			FirstOrCreate(smartphones, models.Category{Name: "Smartphones", Icon: "📱", Parent: eletronicos}).Error; err != nil {
			return err
		}

		audio := &models.Category{}
		if err := tx.Where(models.Category{Name: "Áudio", ParentID: &eletronicos.ID}).
			FirstOrCreate(audio, models.Category{Name: "Áudio", Icon: "🎧", Parent: eletronicos}).Error; err != nil {
			return err
		}

		/* ------------------------------------------------------------------
		   2. Usuários
		------------------------------------------------------------------*/
		users := []*models.User{
			{
				ID:          "kCIjyDgvJpNbpCiaePDXHlQwkU02", // Fixando uid (gerado pelo firebase)
				DisplayName: "Admin",
				Email:       "admin@example.com",
				PhotoURL:    StringPtr("https://i.pravatar.cc/150?u=kCIjyDgvJpNbpCiaePDXHlQwkU02"),
				Role:        models.RoleAdmin,
				University:  StringPtr("Universidade Federal de São Carlos"),
				Whatsapp:    StringPtr("5511999999999"),
				Verified:    true,
			},
			{
				ID:          "1UlfK3Ha5jdmreJQzG0L5EMR2BI3",
				DisplayName: "João Silva",
				Email:       "joao@example.com",
				PhotoURL:    StringPtr("https://i.pravatar.cc/150?u=1UlfK3Ha5jdmreJQzG0L5EMR2BI3"),
				University:  StringPtr("Universidade de São Paulo"),
				Whatsapp:    StringPtr("5511999999999"),
				Verified:    true,
			},
			{
				ID:          "pSKSJ1PWTTYqSn1GiB2zgQJ2NUj2",
				DisplayName: "Maria Souza",
				Email:       "maria@example.com",
				PhotoURL:    StringPtr("https://i.pravatar.cc/150?u=pSKSJ1PWTTYqSn1GiB2zgQJ2NUj2"),
				University:  StringPtr("Universidade de São Paulo"),
				Whatsapp:    StringPtr("5511999999999"),
				Verified:    false,
			},
		}
		for _, u := range users {
			if err := tx.Where("email = ?", u.Email).FirstOrCreate(u).Error; err != nil {
				return err
			}
		}

		/* ------------------------------------------------------------------
		   3. Anúncios
		------------------------------------------------------------------*/
		listings := []*models.Listing{
			{
				UserID:           users[0].ID,
				CategoryID:       notebooks.ID,
				Title:            "MacBook Air M2 13\" (2023)",
				Slug:             slug.Make("MacBook Air M2 13 (2023)"),
				Description:      "Pouquíssimo uso, bateria com 15 ciclos.",
				Price:            7500,
				Condition:        models.Used,
				IsNegotiable:     false,
				SellerCanDeliver: false,
				Location:         "São Carlos - SP",
				Status:           models.Available,
			},
			{
				UserID:           users[1].ID,
				CategoryID:       perifericos.ID,
				Title:            "Teclado Mecânico Redragon Kumara K552",
				Slug:             slug.Make("Teclado Mecânico Redragon Kumara K552"),
				Description:      "Switch Outemu Blue, LED RGB.",
				Price:            200,
				Condition:        models.New,
				IsNegotiable:     true,
				SellerCanDeliver: false,
				Location:         "São Carlos - SP",
				Status:           models.Available,
			},
			{
				UserID:           users[2].ID,
				CategoryID:       smartphones.ID,
				Title:            "iPhone 12 128 GB",
				Slug:             slug.Make("iPhone 12 128GB"),
				Description:      "Tela impecável, sempre com película.",
				Price:            2700,
				Condition:        models.Used,
				IsNegotiable:     true,
				SellerCanDeliver: true,
				Location:         "São Carlos - SP",
				Status:           models.Available,
			},
			{
				UserID:           users[0].ID,
				CategoryID:       audio.ID,
				Title:            "Fone Sony WH-1000XM4",
				Slug:             slug.Make("Fone Sony WH-1000XM4"),
				Description:      "Cancelamento de ruído líder da categoria.",
				Price:            1200,
				Condition:        models.Refurbished,
				IsNegotiable:     false,
				SellerCanDeliver: true,
				Location:         "São Carlos - SP",
				Status:           models.Available,
			},
			{
				UserID:           users[1].ID,
				CategoryID:       perifericos.ID,
				Title:            "Mouse Gamer Logitech G Pro Wireless",
				Slug:             slug.Make("Mouse Gamer Logitech G Pro Wireless"),
				Description:      "Sensor Hero, perfeito estado.",
				Price:            550,
				Condition:        models.Used,
				IsNegotiable:     false,
				SellerCanDeliver: false,
				Location:         "São Carlos - SP",
				Status:           models.Available,
			},
			{
				UserID:           users[2].ID,
				CategoryID:       notebooks.ID,
				Title:            "Dell XPS 13 9310 i7 16 GB",
				Slug:             slug.Make("Dell XPS 13 9310 i7 16GB"),
				Description:      "Tela 4K, garantia até 2026.",
				Price:            8200,
				Condition:        models.New,
				IsNegotiable:     false,
				SellerCanDeliver: false,
				Location:         "São Carlos - SP",
				Status:           models.Available,
			},
			{
				UserID:           users[0].ID,
				CategoryID:       smartphones.ID,
				Title:            "Samsung Galaxy S23 Ultra 256 GB",
				Slug:             slug.Make("Samsung Galaxy S23 Ultra 256GB"),
				Description:      "Lacre de fábrica, cor verde.",
				Price:            5900,
				Condition:        models.New,
				IsNegotiable:     true,
				SellerCanDeliver: false,
				Location:         "São Carlos - SP",
				Status:           models.Available,
			},
			{
				UserID:           users[1].ID,
				CategoryID:       audio.ID,
				Title:            "Caixa JBL Flip 6",
				Slug:             slug.Make("Caixa JBL Flip 6"),
				Description:      "À prova d’água IPX7.",
				Price:            550,
				Condition:        models.Broken,
				IsNegotiable:     true,
				SellerCanDeliver: true,
				Location:         "São Carlos - SP",
				Status:           models.Sold,
			},
		}
		for _, l := range listings {
			if err := tx.Where("slug = ?", l.Slug).FirstOrCreate(l).Error; err != nil {
				return err
			}
		}

		/* ------------------------------------------------------------------
		   4. Imagens
		------------------------------------------------------------------*/
		for _, lst := range listings {
			var count int64
			if err := tx.Model(&models.ListingImage{}).Where("listing_id = ?", lst.ID).Count(&count).Error; err != nil {
				return err
			}

			if count > 0 {
				// Já existem imagens para esse listing, então pula
				// isso é útil para evitar duplicação de imagens em seeds idempotentes
				continue
			}

			// Se não existem, cria duas imagens
			prim := &models.ListingImage{
				ID:        uuid.New(),
				ListingID: lst.ID,
				Src:       "https://picsum.photos/id/0/640/480",
				Order:     0,
				Key:       "example1",
			}
			sec := &models.ListingImage{
				ID:        uuid.New(),
				ListingID: lst.ID,
				Src:       "https://picsum.photos/id/2/640/480",
				Order:     1,
				Key:       "example2",
			}

			if err := tx.Create([]*models.ListingImage{prim, sec}).Error; err != nil {
				return err
			}
		}

		/* ------------------------------------------------------------------
		   5. Favoritos
		------------------------------------------------------------------*/
		favs := []*models.Favorite{
			{UserID: users[1].ID, ListingID: listings[0].ID},
			{UserID: users[1].ID, ListingID: listings[2].ID},
			{UserID: users[2].ID, ListingID: listings[0].ID},
			{UserID: users[2].ID, ListingID: listings[4].ID},
			{UserID: users[0].ID, ListingID: listings[2].ID},
			{UserID: users[0].ID, ListingID: listings[3].ID},
		}
		if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(favs).Error; err != nil {
			return err
		}

		log.Println("✅ Seed executado com sucesso (idempotente)")
		return nil
	})
}
