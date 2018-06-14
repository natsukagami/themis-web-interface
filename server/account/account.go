// Package account provides mechanism for organizing accounts.
package account

// Account represents an account.
type Account struct {
	Username string `json:"username"`
	Password string `json:"-"` // The hashed password
	Name     string `json:"name"`
}
