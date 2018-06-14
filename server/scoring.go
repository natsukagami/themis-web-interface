package server

import (
	"encoding/json"
	"sort"
	"sync"
)

// ScoreWatch returns a score watching utility.
type ScoreWatch struct {
	mu     sync.Mutex
	scores map[string]*Record

	scoreboard []*Record
	problems   []string
	hasChanged bool
}

// NewScoreWatch returns a new ScoreWatch.
func NewScoreWatch() (*ScoreWatch, error) {
	return &ScoreWatch{
		scores:     make(map[string]*Record),
		scoreboard: make([]*Record, 0),
		problems:   make([]string, 0),
	}, nil
}

// Add udpates an user's score.
// The update is an overwrite write.
func (s *ScoreWatch) Add(user, problem string, score float64) {
	s.mu.Lock()
	defer s.mu.Unlock()

	usr, ok := s.scores[user]
	if !ok {
		usr = &Record{Problems: make(map[string]float64)}
		s.scores[user] = usr
		s.scoreboard = append(s.scoreboard, usr)
	}
	usr.Score -= usr.Problems[problem] - score
	usr.Problems[problem] = score

	// Add to problem list if it hasn't yet existed
	if _, ok := lowerBoundFind(s.problems, problem); !ok {
		s.problems = append(s.problems, problem)
		sort.Sort(sort.StringSlice(s.problems)) // Maintain binary-searchability
	}

	s.hasChanged = true
}

// Scoreboard returns the current scoreboard.
// Note that while the request is held without release, ScoreWatch will be completely frozen.
func (s *ScoreWatch) Scoreboard() (sc Scoreboard, unlock func()) {
	s.mu.Lock()

	if s.hasChanged {
		// We have to sort the rows again
		sort.Slice(s.scoreboard, func(i, j int) bool {
			a := s.scoreboard[i]
			b := s.scoreboard[j]
			// Sort by total score...
			if a.Score != b.Score {
				return a.Score < b.Score
			}
			// Then by scores from left to right
			for _, p := range s.problems {
				if a.Problems[p] != b.Problems[p] {
					return a.Problems[p] < b.Problems[p]
				}
			}
			return false
		})
		s.hasChanged = true
	}

	return Scoreboard{
		Problems: s.problems,
		Records:  s.scoreboard,
	}, s.mu.Unlock
}

// Binary search the position of a match.
func lowerBoundFind(list []string, match string) (int, bool) {
	lo, hi := 0, len(list)
	for lo < hi {
		mid := (lo + hi) >> 1
		if list[mid] < match {
			lo = mid + 1
		} else {
			hi = mid
		}
	}
	if lo == len(list) || list[lo] != match {
		return 0, false
	}
	return lo, true
}

// Scoreboard represents an old-school scoreboard struct.
type Scoreboard struct {
	Problems []string  `json:"problems"`
	Records  []*Record `json:"contestants"`
}

// Record holds an user's score by problems.
type Record struct {
	Score    float64
	Problems map[string]float64
}

// MarshalJSON returns the old-server-compatible version of the record.
func (r Record) MarshalJSON() ([]byte, error) {
	mp := make(map[string]float64)
	mp["total"] = r.Score
	for id, p := range r.Problems {
		mp[id] = p
	}
	return json.Marshal(mp)
}
