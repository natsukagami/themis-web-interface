// Package expected defines Expected errors, to be distinct from Unexpected errors.
// The errors implemented by expected are completely compatible with `errors` and
// `github.com/pkg/errors` package.
//
// What are expected errors? Anything that you may expect that can happen (e.g. user inputting
// incorrect requests)
package expected

import (
	"fmt"

	"github.com/pkg/errors"
)

type expectedError struct {
	cause error
}

// Implements the `error` interface.
func (e expectedError) Error() string { return e.cause.Error() }

// Implements the Format function, to be compatible with github.com/pkg/errors
func (e expectedError) Format(s fmt.State, verb rune) { e.cause.(fmt.Formatter).Format(s, verb) }

// New creates a new Expected error.
func New(message string) error {
	return expectedError{cause: errors.New(message)}
}

// Errorf is an "Expected" version of `fmt.Errorf`
func Errorf(format string, args ...interface{}) error {
	return expectedError{cause: errors.Errorf(format, args...)}
}

// Check returns whether an error is Expected.
func Check(err error) bool {
	_, ok := errors.Cause(err).(expectedError)
	return ok
}
