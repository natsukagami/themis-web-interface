// Package auth implements the Authentication API.
package auth

import (
	"log"

	"github.com/go-chi/chi"
	"github.com/natsukagami/themis-web-interface/server/account"
	"github.com/natsukagami/themis-web-interface/server/config"
	"github.com/natsukagami/themis-web-interface/server/expected"
	"github.com/natsukagami/themis-web-interface/server/serve"
	"github.com/natsukagami/themis-web-interface/server/serve/mux"
)

// Some predefined stuff
var (
	ErrLoggedIn     = expected.New("Bạn đã đăng nhập")
	ErrInvalidCreds = expected.New("Tên đăng nhập hoặc mật khẩu không chính xác")

	ErrInvalidPassword = expected.New("Password phải có độ dài từ 6-32")
)

// New returns a new Authentication API
func New(acc account.Map, session serve.SessionStore, cfg *config.Config) mux.API {
	a := &Auth{Map: acc, Session: session, Config: cfg}
	return mux.API{
		Path: "/auth",
		Routing: func(r chi.Router) {
			log.Println("Registered auth routing")
			r.Post("/login", a.Login)
			r.Post("/logout", session.MustSession(a.Logout))
			r.Post("/verify", session.MustSession(a.Verify))
			r.Post("/register", a.Register)
		},
	}
}

// Auth represents an API handler for authentication.
// This is the struct where we will implement all important handling functions
type Auth struct {
	Map     account.Map
	Session serve.SessionStore
	Config  *config.Config
}
