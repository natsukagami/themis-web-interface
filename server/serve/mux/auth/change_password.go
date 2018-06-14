package auth

import (
	"net/http"

	"github.com/natsukagami/themis-web-interface/server/serve/verify"

	"github.com/natsukagami/themis-web-interface/server/account"
	"github.com/natsukagami/themis-web-interface/server/serve"
)

// ChangePassword allows an user to change their password.
//
//  Requires: session.MustSession
//  Takes `current_password` and `new_password`
//  Returns: `true`
func (a *Auth) ChangePassword(w http.ResponseWriter, r *http.Request) {
	// Verifies input
	newPassword, ok := verify.String(r.FormValue("new_password"), verify.Len(6, 32))
	if !ok {
		serve.BadRequest(w, ErrInvalidPassword)
		return
	}

	username, err := a.Session.Get(r)
	if err != nil {
		// Since we had MustSession, any error here is unexpected
		serve.Unexpected(w, err)
		return
	}

	// Perform the change
	if err := a.Map.Set(&account.Changes{
		Username:        username,
		CurrentPassword: r.FormValue("current_password"),
		Password:        newPassword,
	}); err != nil {
		serve.Error(w, err, 400)
		return
	}

	serve.Reply(w, true)
}
