package mux

import (
	"net/http"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/gobuffalo/packr"
	"github.com/pkg/errors"
)

// Mux is the root Mux of TWI web server.
// It is actually just a chi.Router with predefined routes.
type Mux struct {
	chi.Router
}

// API represents an API handlers.
// They are implemented in this package's subfolders.
type API struct {
	Path    string
	Routing func(chi.Router)
}

// New creates a new root Mux.
func New(APIs ...API) (*Mux, error) {
	mux := &Mux{
		Router: chi.NewRouter(),
	}
	return mux, mux.init(APIs...)
}

func (m *Mux) initAPIs(r chi.Router, APIs ...API) {
	// Register APIs here
	for _, api := range APIs {
		r.Route(api.Path, api.Routing)
	}
}

// Loads all routes and assets into the Mux.
func (m *Mux) init(APIs ...API) error {
	// A good base middleware stack
	m.Use(middleware.RequestID)
	m.Use(middleware.RealIP)
	m.Use(middleware.Logger)
	m.Use(middleware.Recoverer)

	// Set a timeout value on the request context (ctx), that will signal
	// through ctx.Done() that the request has timed out and further
	// processing should be stopped.
	m.Use(middleware.Timeout(60 * time.Second))

	// Declare APIs
	m.Route("/api", func(r chi.Router) {
		m.initAPIs(r, APIs...)
	})

	// Static assets, living in /interface/public
	staticAssets := packr.NewBox("../../../interface/build")

	// Cache the home page
	homepage, err := staticAssets.MustBytes("index.html")
	if err != nil {
		return errors.Wrap(err, "Khởi tạo trang chủ")
	}
	fs := http.FileServer(staticAssets)

	// Serve all static files on /public
	m.Get("/*", func(w http.ResponseWriter, r *http.Request) {
		// Try to find the file
		filepath := r.URL.EscapedPath()[1:] // Removes the prefixing /
		if staticAssets.Has(filepath) {
			fs.ServeHTTP(w, r)
		} else {
			w.Write(homepage)
		}
	})

	return nil
}
