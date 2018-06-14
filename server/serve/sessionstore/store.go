package sessionstore

import (
	"crypto/rand"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/natsukagami/themis-web-interface/server/serve"
	"github.com/pkg/errors"
)

const sessionName = "themis_web_interface_"
const expireDuration = time.Hour * 24
const keyLength = 32

// Store implements the SessionStore interface.
// It generates a sequence of bytes that resolves to a memory table.
type Store struct {
	mu sync.Mutex
	m  map[string]*serve.Session

	delete chan string
}

// Assert interface
var _ = serve.SessionStore((*Store)(nil))

// New returns a new Store.
func New() *Store {
	return &Store{
		m: make(map[string]*serve.Session),
	}
}

// Delete removes a cookie from the database.
func (s *Store) Delete(w http.ResponseWriter, r *http.Request) error {
	key, err := r.Cookie(sessionName)
	if err == http.ErrNoCookie {
		return serve.ErrNoSession
	} else if err != nil {
		return errors.Wrap(err, "Nhận cookie")
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.m, key.Value)

	// Write the Cookie-Deleting cookie
	http.SetCookie(w, &http.Cookie{Name: sessionName, Value: "", MaxAge: -1})
	return nil
}

// Get returns the username associated to the session, or not...
func (s *Store) Get(r *http.Request) (username string, err error) {
	key, err := r.Cookie(sessionName)
	if err == http.ErrNoCookie {
		return "", serve.ErrNoSession
	} else if err != nil {
		return "", errors.Wrap(err, "Nhận cookie")
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	// Try to fetch the session
	if session, ok := s.m[key.Value]; ok {
		return session.Username, nil
	}
	return "", serve.ErrSessionExpired
}

func randomHex(ln int) (string, error) {
	if ln%4 != 0 {
		return "", errors.New("Độ dài của hex phải là bội của 4")
	}
	ln /= 4
	// Read from random source
	var b = make([]byte, ln)
	if _, err := rand.Read(b); err != nil {
		return "", errors.Wrap(err, "Sinh hex random")
	}
	return fmt.Sprintf("%x", b), nil
}

// Set creates and sets the session cookie.
func (s *Store) Set(w http.ResponseWriter, username string) error {
	expire := time.Now().Add(expireDuration)
	var key string
	var err error
	s.mu.Lock()
	defer s.mu.Unlock()
	if key, err = randomHex(keyLength); err != nil {
		// ! Hmm
		return errors.Wrap(err, "Tạo Cookie")
	}
	if _, ok := s.m[key]; ok {
		return errors.New("Lỗi tạo Cookie")
	}

	s.m[key] = &serve.Session{
		Username: username,
		Expire:   expire,
	}

	http.SetCookie(w, &http.Cookie{Name: sessionName, Value: string(key), Expires: expire})
	return nil
}

// MustSession wraps a handler, requiring the user to own a valid session.
func (s *Store) MustSession(h http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if _, err := s.Get(r); err != nil {
			if errors.Cause(err) == serve.ErrNoSession || errors.Cause(err) == serve.ErrSessionExpired {
				serve.Error(w, err, 401) // Expected error, unauthorized request
			} else {
				serve.Unexpected(w, err) // Unexpected
			}
			return
		}

		// Continue the handling
		h.ServeHTTP(w, r)
	})
}
