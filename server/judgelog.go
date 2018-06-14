package server

import (
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/pkg/errors"
)

// Log represents a Themis log.
type Log struct {
	User    string    // Username of the owner of the submission
	Problem string    // Problem that the submission solves
	Created time.Time // The Creation time of the log

	Score   float64 // The submission's score
	Verdict string  // Another verdict than score, if any

	Details     string // If the submission is non-scored, the judge details
	TestDetails []Test // If the submission is scored, details of each test
}

// Test represents a test result in the judge log.
type Test struct {
	ID      string  `json:"id"`
	Score   float64 `json:"score"`
	Time    float64 `json:"time"`
	Verdict string  `json:"verdict"`
}

// ParseLog parses the log from the given information.
//
// ! If the log is not found, (nil, nil) is returned.
func ParseLog(file, user, problem string) (*Log, error) {
	f, err := os.Open(file)
	if err != nil {
		if err == os.ErrNotExist {
			// No such file exists
			return nil, nil
		}
		return nil, errors.Wrap(err, "Tìm kết quả chấm")
	}
	stat, err := os.Stat(file)
	if err != nil {
		return nil, errors.Wrap(err, "Tìm kết quả chấm")
	}
	// parse it
	log := &Log{
		User:    user,
		Problem: problem,
		Created: stat.ModTime(),
	}
	return log, errors.Wrap(log.parse(f), "Tìm kết quả chấm")
}

func logFilename(user, problem, ext string) string {
	return fmt.Sprintf("0[%s][%s]%s.log", user, problem, ext)
}

type logJSON struct {
	Created int64  `json:"created"` // Timestamp in millisecond (JavaScript)
	User    string `json:"user"`
	Problem string `json:"problem"`
	Content struct {
		Verdict interface{} `json:"verdict"`
		Details interface{} `json:"details"`
	} `json:"content"`
}

// MarshalJSON returns the JSON representation of the log.
func (l Log) MarshalJSON() (b []byte, err error) {
	s := logJSON{
		Created: l.Created.UnixNano() / int64(time.Millisecond/time.Nanosecond),
		User:    l.User,
		Problem: l.Problem,
	}
	if l.Verdict != "" {
		// This submission is non-scored
		s.Content.Verdict = l.Verdict
		s.Content.Details = l.Details
	} else {
		// This submission is scored
		s.Content.Verdict = l.Score
		s.Content.Details = l.TestDetails
	}
	b, err = json.Marshal(s)
	return b, errors.Wrap(err, "Dịch kết quả")
}
