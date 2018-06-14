package verify

// Len limits the length of the string to bounds.
func Len(min int, max int) StringOpt {
	return StringOpt(func(s string) (string, bool) {
		return s, len(s) >= min && len(s) <= max
	})
}
