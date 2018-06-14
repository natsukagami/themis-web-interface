package account

import "github.com/pkg/errors"

// Verify tries to fetch an user from the corresponding username and password.
// If no users match, returns (nil, nil).
func Verify(m Map, username, password string) (*Account, error) {
	// First get the user from the map
	a, err := m.Get(username)
	if err != nil {
		return nil, errors.Wrap(err, "Đăng nhập")
	}
	if a == nil {
		return nil, nil
	}
	// Then we try to verify the password
	if md5Of(password) != a.Password {
		return nil, nil
	}
	return a, nil
}
