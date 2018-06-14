package main

import (
	"net/http"

	"github.com/natsukagami/themis-web-interface/server/account"
	"github.com/natsukagami/themis-web-interface/server/config"
	"github.com/natsukagami/themis-web-interface/server/serve/mux"
	"github.com/natsukagami/themis-web-interface/server/serve/mux/auth"
	"github.com/natsukagami/themis-web-interface/server/serve/mux/info"
	"github.com/natsukagami/themis-web-interface/server/serve/sessionstore"
)

func main() {
	cfg, err := config.New("$APPDATA\\Local\\themis-web-interface.toml", "config.toml")
	if err != nil {
		panic(err)
	}

	accMap, err := account.NewXMLMap("./server/account/account.fixed.xml")
	if err != nil {
		panic(err)
	}
	session := sessionstore.New()

	mux, err := mux.New(auth.New(accMap, session, cfg), info.New(cfg))
	if err != nil {
		panic(err)
	}
	http.ListenAndServe(":3333", mux)
}
