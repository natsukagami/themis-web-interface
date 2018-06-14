package account

import "github.com/natsukagami/themis-web-interface/server/expected"

// Defined errors that are considered non-system.
var (
	ErrUsernameExisted = expected.New("Username đã tồn tại")
)

// Map represents a data structure that saves accounts' information.
type Map interface {
	List() ([]*Account, error)
	// ! Get WILL return (nil, nil) if there's no Account, rather than an error. Be careful!
	Get(username string) (*Account, error)
	Set(*Changes) error
	Create(*Account) error
}

// Changes list all possible changes to an account
type Changes struct {
	Username        string `json:"username"` // Used as identification
	CurrentPassword string `json:"currentPassword"`
	Password        string `json:"password,omitempty"`
}
