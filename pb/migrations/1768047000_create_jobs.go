package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection := core.NewBaseCollection("jobs")

		// Title field
		collection.Fields.Add(&core.TextField{
			Name:     "title",
			Required: true,
		})

		// Company field
		collection.Fields.Add(&core.TextField{
			Name:     "company",
			Required: false,
		})

		// Salary fields
		collection.Fields.Add(&core.NumberField{
			Name:     "salaryMin",
			Required: false,
		})

		collection.Fields.Add(&core.NumberField{
			Name:     "salaryMax",
			Required: false,
		})

		collection.Fields.Add(&core.TextField{
			Name:     "currency",
			Required: false,
		})

		// Grade field
		collection.Fields.Add(&core.TextField{
			Name:     "grade",
			Required: false,
		})

		// Location field
		collection.Fields.Add(&core.TextField{
			Name:     "location",
			Required: false,
		})

		// Remote field
		collection.Fields.Add(&core.BoolField{
			Name: "isRemote",
		})

		// Description field
		collection.Fields.Add(&core.TextField{
			Name:     "description",
			Required: false,
		})

		// Skills as JSON array
		collection.Fields.Add(&core.JSONField{
			Name:     "skills",
			Required: false,
		})

		// URL to original message
		collection.Fields.Add(&core.URLField{
			Name:     "url",
			Required: false,
		})

		// Original message text
		collection.Fields.Add(&core.TextField{
			Name:     "originalText",
			Required: true,
		})

		// Channel ID for deduplication
		collection.Fields.Add(&core.TextField{
			Name:     "channelId",
			Required: false,
		})

		// Message ID for deduplication
		collection.Fields.Add(&core.NumberField{
			Name:     "messageId",
			Required: false,
		})

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("jobs")
		if err != nil {
			return nil // Collection doesn't exist, nothing to delete
		}
		return app.Delete(collection)
	})
}
