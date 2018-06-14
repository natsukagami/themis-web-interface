package verify

// Bounds limits the int to a bound.
// If the bounds are not met, it
//  - discards the value if `set` is false
//  - updates the value (to either bounds) if `set` is true
func Bounds(min int, max int, set bool) IntOpt {
	return IntOpt(func(i int) (int, bool) {
		v := i
		if v < min {
			v = min
		}
		if v > max {
			v = max
		}
		return v, set || (i >= min && i <= max)
	})
}
