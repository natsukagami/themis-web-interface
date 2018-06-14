// Package verify provides mechanism for input verification and sanitation.
package verify

import "strconv"

type (
	// StringOpt represents options on string verification and sanitation.
	StringOpt func(string) (string, bool)
	// IntOpt represents options on int verification and sanitation.
	IntOpt func(int) (int, bool)
	// BoolOpt represents options on bool verification and sanitation.
	BoolOpt func(bool) (bool, bool)
)

// String puts a string through various verification and sanitation.
func String(input string, opts ...StringOpt) (string, bool) {
	ok := true
	for _, opt := range opts {
		input, ok = opt(input)
		if !ok {
			break
		}
	}
	return input, ok
}

// Int puts an int through various verification and sanitation.
func Int(input int, opts ...IntOpt) (int, bool) {
	ok := true
	for _, opt := range opts {
		input, ok = opt(input)
		if !ok {
			break
		}
	}
	return input, ok
}

// IntStr converts then verifies/sanitizes the input into an int.
func IntStr(input string, opts ...IntOpt) (int, bool) {
	if v, err := strconv.Atoi(input); err == nil {
		return Int(v, opts...)
	}
	return 0, false
}

// Bool puts a bool through various verification and sanitation.
func Bool(input bool, opts ...BoolOpt) (bool, bool) {
	ok := true
	for _, opt := range opts {
		input, ok = opt(input)
		if !ok {
			break
		}
	}
	return input, ok
}

// BoolStr converts then verifies/sanitizes the input into a bool.
// The function accepts many forms of boolean strings.
//
// A `true` value can be one of the following:
//
//  true
//  yes
//  1
//
// A `false` value can be one of the following:
//
//  false
//  no
//  0
//  "" (an empty string)
//
// Any other values will be regarded as an invalid string.
func BoolStr(input string, opts ...BoolOpt) (bool, bool) {
	if input == "true" || input == "yes" || input == "1" {
		return Bool(true, opts...)
	} else if input == "false" || input == "no" || input == "0" || input == "" {
		return Bool(false, opts...)
	}
	return false, false
}
