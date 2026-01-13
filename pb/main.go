package main

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	_ "svpb-tmpl/migrations"
)

func main() {
	godotenv.Load("../.env")

    

	app := pocketbase.New()

    app.OnServe().BindFunc(func(se *core.ServeEvent) error {
        // se.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), false))
        
        se.Router.GET("/{path...}", func(e *core.RequestEvent) error {
            path := e.Request.PathValue("path")
            fsys := os.DirFS("./pb_public")

            // --- PWA treatment block ---
            // If the request is for PWA system files - serve them with no cache
            if path == "sw.js" || strings.HasPrefix(path, "workbox-") {
                e.Response.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
                e.Response.Header().Set("Pragma", "no-cache")
                e.Response.Header().Set("Expires", "0")
                
                // Try to serve the file. If an error occurs, a standard 404 from PocketBase will be returned,
                // but we at least try to serve the correct file with the correct headers.
                return e.FileFS(fsys, path)
            }
            // ------------------------

            // 1. Try to serve a regular static file (images, css, etc.)
            err := e.FileFS(fsys, path)
            if err == nil {
                return nil
            }

            // 2. SPA Fallback (index.html)
            // Ignore API and admin (_/)
            if !strings.HasPrefix(path, "api/") && !strings.HasPrefix(path, "_/") {
                return e.FileFS(fsys, "index.html")
            }

            return nil
        })

        // API routes are registered separately, they have priority
        // bookings.API(se, app)

        return se.Next()
    })

    isGoRun := strings.HasPrefix(os.Args[0], os.TempDir())
    migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
        Automigrate: isGoRun,
    })

	// Bookings
	// bookings.Hooks(app)
	// bookings.Crons(app)

    if err := app.Start(); err != nil {
        log.Fatal(err)
    }
}

