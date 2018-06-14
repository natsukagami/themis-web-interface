package auth

import (
	"net/http"

	"github.com/natsukagami/themis-web-interface/server/account"
	"github.com/natsukagami/themis-web-interface/server/expected"
	"github.com/natsukagami/themis-web-interface/server/serve"

	config "github.com/natsukagami/themis-web-interface/server/config"
	"github.com/natsukagami/themis-web-interface/server/serve/verify"
)

// Register serves /register requests.
//
//  Method: POST
//  Takes `username` (6-18 any characters), `password` (6-32 any characters), `display_name` (6-32 any characters)
//  Returns: true
func (a *Auth) Register(w http.ResponseWriter, r *http.Request) {
	// If the config does not allow registration, we just don't do so.
	if !a.allowRegistration() {
		serve.Error(w, expected.New("Máy chủ không cho phép đăng kí"), 403)
		return
	}

	// Verifies the input
	username, ok := verify.String(r.FormValue("username"), verify.Len(6, 18))
	if !ok {
		serve.Error(w, expected.New("Username phải có độ dài từ 6-18"), 400)
		return
	}
	password, ok := verify.String(r.FormValue("password"), verify.Len(6, 32))
	if !ok {
		serve.Error(w, ErrInvalidPassword, 400)
		return
	}
	displayName, ok := verify.String(r.FormValue("display_name"), verify.Len(6, 32))
	if !ok {
		serve.Error(w, expected.New("Tên hiển thị phải có độ dài từ 6-32"), 400)
		return
	}

	// Try to insert into database.
	if err := a.Map.Create(&account.Account{
		Username: username,
		Password: password,
		Name:     displayName,
	}); err != nil {
		serve.Error(w, err, 400)
		return
	}

	serve.Reply(w, true)
}

func (a *Auth) allowRegistration() bool {
	return a.Config.Bool(config.AllowRegistration, false)
}
