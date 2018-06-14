package auth

import (
	"net/http"

	"github.com/natsukagami/themis-web-interface/server/serve"
)

// Logout serves logout requests.
//
//  Requires: session.MustSession
//  Path: POST /logout
//  Returns: `true`
func (a *Auth) Logout(w http.ResponseWriter, r *http.Request) {
	// Simply removes the cookie
	if err := a.Session.Delete(w, r); err != nil {
		serve.Unexpected(w, err)
		return
	}

	serve.Reply(w, true)
}
