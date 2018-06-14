package server

import (
	"log"
	"sync"

	"github.com/fsnotify/fsnotify"
	"github.com/pkg/errors"
)

// LogMap watches a Log folder and gives pending log changes.
type LogMap struct {
	mu      sync.Mutex
	m       map[string]*Log     // filename => parsed log
	changed map[string]struct{} // Records change, so next request will reload
	sw      *ScoreWatch
}

// NewLogMap returns a new map.
// Optionally pass a ScoreWatch so that scores are automatically updated.
func NewLogMap(folder string, sw *ScoreWatch) (*LogMap, error) {
	l := &LogMap{
		m:       make(map[string]*Log),
		changed: make(map[string]struct{}),
		sw:      sw,
	}
	go l.watch(folder)
	return l, nil
}

// Request returns a log from the map.
// Returns `nil` if no log is found.
func (l *LogMap) Request(user, problem, ext string) *Log {
	l.mu.Lock()
	defer l.mu.Unlock()
	filename := logFilename(user, problem, ext)
	if _, ok := l.changed[filename]; ok {
		delete(l.changed, filename)
		// There's been a change. Reload the file
		if lg, err := ParseLog(filename, user, problem); err != nil {
			log.Println(err)
		} else {
			log.Println("Kết quả chấm được cập nhật: " + filename)
			l.m[filename] = lg
			// Update scorewatch
			if l.sw != nil {
				l.sw.Add(user, problem, lg.Score)
			}
		}
	}
	return l.m[filename]
}

// Watch for events
func (l *LogMap) watch(folder string) {
	// Configure watcher
	w, err := fsnotify.NewWatcher()
	if err != nil {
		panic(err)
	}
	if err := w.Add(folder); err != nil {
		panic(err)
	}

	for {
		select {
		case e := <-w.Events:
			// Ignore events other than these 2
			if e.Op != fsnotify.Create && e.Op != fsnotify.Write {
				continue
			}
			l.mu.Lock()
			l.changed[e.Name] = struct{}{}
			l.mu.Unlock()
		case e := <-w.Errors:
			log.Println(errors.Wrap(e, "Theo dõi thư mục chấm bài"))
		}
	}
}
