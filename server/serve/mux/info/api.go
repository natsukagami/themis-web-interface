// Package info serves information about the server.
package info

import (
	"github.com/go-chi/chi"
	"github.com/natsukagami/themis-web-interface/server/config"
	"github.com/natsukagami/themis-web-interface/server/serve/mux"
)

// New creates a new Info API.
func New(cfg *config.Config) mux.API {
	a := &API{
		cfg: cfg,
	}
	return mux.API{
		Path: "/info",
		Routing: func(r chi.Router) {
			r.Get("/", a.Server)
			r.Get("/server", a.Server)
			r.Get("/contest", a.Contest)
		},
	}
}

// API provides serve functions for /info.
type API struct {
	cfg *config.Config
}
