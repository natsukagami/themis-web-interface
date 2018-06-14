package info

import (
	"net/http"

	"github.com/natsukagami/themis-web-interface/server/config"
	"github.com/natsukagami/themis-web-interface/server/serve"
)

type serverResponse struct {
	Title string `json:"title"`
}

// Server serves / and /server requests.
//
//  Method: GET
//  Returns: serverResponse
func (a *API) Server(w http.ResponseWriter, r *http.Request) {
	serve.Reply(w, serverResponse{
		Title: a.cfg.String(config.ServerName, config.DefaultServerName),
	})
}
