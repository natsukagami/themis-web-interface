package auth

import (
	"net/http"

	"github.com/natsukagami/themis-web-interface/server/account"
	"github.com/natsukagami/themis-web-interface/server/serve"
)

// Login serves login requests.
//
//  Path: POST /login
//  Takes `username` and `password`
//  Returns: `true`
func (a *Auth) Login(w http.ResponseWriter, r *http.Request) {
	// If the user has logged in, shout WTF
	if _, err := a.Session.Get(r); err == nil {
		serve.Error(w, ErrLoggedIn, 400)
		return
	}

	// Log in!
	user, err := account.Verify(a.Map, r.FormValue("username"), r.FormValue("password"))
	if err != nil {
		serve.Unexpected(w, err)
		return
	}
	if user == nil {
		serve.Error(w, ErrInvalidCreds, 400)
		return
	}

	// Sets the cookie for the user.
	if err := a.Session.Set(w, user.Username); err != nil {
		serve.Unexpected(w, err)
		return
	}

	// Should we, return, anything?
	serve.Reply(w, true)
}
