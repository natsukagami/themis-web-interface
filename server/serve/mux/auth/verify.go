package auth

import (
	"errors"
	"net/http"

	"github.com/natsukagami/themis-web-interface/server/serve"
)

// Verify serves /verify requests.
//
//  Requires: session.MustSession
//  Returns: the user logged in
func (a *Auth) Verify(w http.ResponseWriter, r *http.Request) {
	username, err := a.Session.Get(r)
	if err != nil {
		serve.Unexpected(w, err)
		return
	}

	user, err := a.Map.Get(username)
	if err != nil {
		serve.Unexpected(w, err)
		return
	}
	// If the user is not found, something's wrong.
	if user == nil {
		serve.Unexpected(w, errors.New("Không tìm thấy user"))
		return
	}

	serve.Reply(w, user)
}
