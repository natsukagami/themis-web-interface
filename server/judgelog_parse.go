package server

import (
	"bufio"
	"fmt"
	"io"
	"strconv"
	"strings"

	"github.com/pkg/errors"
)

func (l *Log) parse(r io.Reader) error {
	lines := bufio.NewScanner(r)
	lineCount := 0
	// Parse the verdict
	if lines.Scan() {
		lineCount++
		ls := scanLine(lines.Text())
		if !ls.Expect(fmt.Sprintf("%s‣%s: ", l.User, l.Problem)) {
			return errors.Errorf("Lỗi đọc kết quả chấm, dòng %d", lineCount)
		}
		verdict := ls.Consume(0) // Consume til the end
		if verdict == "" {
			return errors.Errorf("Lỗi đọc kết quả chấm, dòng %d, kết quả trả về rỗng", lineCount)
		}
		score, err := parseFloat(verdict)
		if err != nil {
			l.Verdict = verdict
		} else {
			l.Score = score
		}
	}

	lineCount++
	if !lines.Scan() {
		// Ignore this line, if it's not available, it's an error
		return errors.Errorf("Lỗi đọc kết quả chấm, dòng %d", lineCount)
	}

	if l.Verdict != "" {
		// If the result is a verdict, parse all the rest and append them.
		for lines.Scan() {
			if l.Details != "" {
				l.Details += "\n"
			}
			l.Details += lines.Text()
		}
	} else {
		l.TestDetails = nil
		// Parse every test
		for lines.Scan() {
			lineCount++
			var err error
			ls := scanLine(lines.Text())
			// Ok, now we can grab the test name
			test := Test{}
			// Check if this is a test indicating line
			if !ls.Expect(fmt.Sprintf("%s‣%s‣", l.User, l.Problem)) {
				goto NotTestIndicator
			}
			test.ID = ls.Consume(':')
			if test.ID == "" {
				// Something's off... not a test indicator?
				goto NotTestIndicator
			}
			// The rest of the line is the test's score.
			test.Score, err = parseFloat(ls.Consume(0))
			if err != nil {
				goto NotTestIndicator // How about we ignore the whole thing haha
			}
			// Ok so new test
			l.TestDetails = append(l.TestDetails, test)
			continue
		NotTestIndicator:
			// Must be the previous test's judge line!
			// If it's not,... just ignore it I guess
			if l.TestDetails == nil {
				continue
			}
			prev := &l.TestDetails[len(l.TestDetails)-1]
			// It could be a running time-indicating line
			if ls.Expect("Thời gian ≈ ") {
				runningTime, err := parseFloat(ls.Consume(' '))
				if err == nil {
					// Ok, so it IS time
					prev.Time = runningTime
					continue
				}
			}
			if prev.Verdict != "" {
				prev.Verdict += "\n"
			}
			prev.Verdict += ls.Consume(0)
		}
	}

	return errors.Wrapf(lines.Err(), "Lỗi đọc kết quả chấm, dòng %d", lineCount)
}

// A type for RegExp-less matching.
type lineScanner []byte

func scanLine(input string) lineScanner {
	return lineScanner([]byte(strings.ToLower(input)))
}

// Expect matches the lineScanner with the given prefix,
// consuming it if it matches.
func (l *lineScanner) Expect(prefix string) bool {
	prefix = strings.ToLower(prefix)
	pb := []byte(prefix)
	if len(pb) > len(*l) {
		return false
	}

	for i := 0; i < len(pb); i++ {
		if pb[i] != (*l)[i] {
			return false
		}
	}

	*l = (*l)[len(pb):]
	return true
}

// Consume takes characters from the beginning of the line
// scanner until the delim is consumed.
func (l *lineScanner) Consume(delim byte) string {
	b := *l
	for i := 0; i < len(b); i++ {
		if b[i] == delim {
			*l = b[i+1:]
			return strings.TrimSpace(string(b[0:i]))
		}
	}
	*l = nil
	return strings.TrimSpace(string(b))
}

func parseFloat(s string) (float64, error) {
	s = strings.Replace(s, ",", ".", -1)
	return strconv.ParseFloat(s, 64)
}
