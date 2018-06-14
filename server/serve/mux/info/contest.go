package info

import (
	"log"
	"net/http"
	"time"

	"github.com/natsukagami/themis-web-interface/server/config"
	"github.com/natsukagami/themis-web-interface/server/serve"

	"github.com/natsukagami/themis-web-interface/server/expected"
)

type contestResponse struct {
	Name      string    `json:"name"`
	StartTime time.Time `json:"start_time"`
	EndTime   time.Time `json:"end_time"`
}

// Contest serves /contest requests.
//
//  Method: GET
//  Returns: contestResponse
//  Note: Returns `404` if contest is disabled or not correctly configured.
func (a *API) Contest(w http.ResponseWriter, r *http.Request) {
	if err := a.cfg.ContestConfigured(); err != nil {
		if !expected.Check(err) {
			// Unexpected!
			log.Println(err)
		}
		serve.Error(w, expected.New("Contest không được thiết lập"), 404)
		return
	}

	serve.Reply(w, contestResponse{
		Name:      a.cfg.String(config.ContestName, ""),
		StartTime: a.cfg.Time(config.ContestStartTime, time.Time{}),
		EndTime:   a.cfg.Time(config.ContestEndTime, time.Time{}),
	})
}
