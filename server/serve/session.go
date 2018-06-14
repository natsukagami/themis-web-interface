package serve

import (
	"net/http"
	"time"

	"github.com/natsukagami/themis-web-interface/server/expected"
)

// The session implementation kinda resembles JWT.
// But it's much simpler.

// Some non-fatal errors you can use.
var (
	ErrNoSession      = expected.New("Bạn chưa đăng nhập")
	ErrSessionExpired = expected.New("Đã hết phiên làm việc")
)

// Session records an user's access to the service.
// Session expire time and version are dependent on the SessionManager.
type Session struct {
	// * JSON names kinda reminds of JWT haha
	Username string    `json:"sub"`
	Expire   time.Time `json:"exp"`
}

// SessionStore encodes, decodes and verifies a request.
// An implementation of the SessionManager can be found at /server/serve/sessionstore
type SessionStore interface {
	Set(w http.ResponseWriter, username string) error
	Get(r *http.Request) (string, error)
	Delete(w http.ResponseWriter, r *http.Request) error
	MustSession(h http.HandlerFunc) http.HandlerFunc
}
