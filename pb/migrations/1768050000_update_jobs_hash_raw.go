package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("jobs")
		if err != nil {
			return err
		}

		// Hash field for content-based deduplication
		collection.Fields.Add(&core.TextField{
			Name:     "hash",
			Required: false,
		})

		// Raw data field for debugging
		collection.Fields.Add(&core.JSONField{
			Name:     "raw",
			Required: false,
		})

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("jobs")
		if err != nil {
			return nil
		}

		collection.Fields.RemoveByName("hash")
		collection.Fields.RemoveByName("raw")

		return app.Save(collection)
	})
}
