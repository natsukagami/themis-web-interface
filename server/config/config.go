package config

import (
	"log"
	"os"
	"sync"
	"time"

	"github.com/pkg/errors"

	"github.com/BurntSushi/toml"
)

// Config represents the underlying Config interface.
// Every call to Set will trigger a synchronorous write of the file.
type Config struct {
	mu sync.RWMutex
	m  map[string]interface{} // Consists of *only* the primitive values

	writePath string
	writeMap  map[string]interface{}
}

// New scans all the files listed and merge them to create *one* config interface.
// Overrides are made in the order of files listed.
// Throws an error if no files are provided.
// If writes are made, it will be written on the last filepath listed.
func New(files ...string) (*Config, error) {
	if len(files) == 0 {
		return nil, errors.New("Không có file thiết lập nào")
	}

	// Start reading all files and copy all keys in
	c := &Config{
		m: make(map[string]interface{}),
	}
	for _, file := range files {
		var current map[string]interface{}

		c.writeMap = nil // Not the last one

		_, err := toml.DecodeFile(file, &current)
		if err != nil {
			if os.IsNotExist(errors.Cause(err)) {
				log.Println("Không tìm thấy file " + file + ", bỏ qua")
				continue
			}
			return nil, errors.Wrap(err, "Đọc file thiết lập")
		}

		// Sets the writePath
		c.writePath = file
		c.writeMap = current
		// Merge the map in
		for key, value := range current {
			c.m[key] = value
		}
	}

	if c.writeMap == nil {
		// We need to create a new file
		c.writePath = files[len(files)-1]
		c.writeMap = make(map[string]interface{})
	}

	return c, nil
}

// Get returns a value of the config.
func (c *Config) Get(key string, fallback interface{}) interface{} {
	c.mu.RLock()
	defer c.mu.RUnlock()
	v, ok := c.m[key]
	if !ok {
		return fallback
	}
	return v
}

// Int gets an int.
func (c *Config) Int(key string, fallback int) int {
	if v, ok := c.Get(key, fallback).(int); ok {
		return v
	}
	return fallback
}

// Bool gets a bool.
func (c *Config) Bool(key string, fallback bool) bool {
	if v, ok := c.Get(key, fallback).(bool); ok {
		return v
	}
	return fallback
}

// String gets a string.
func (c *Config) String(key string, fallback string) string {
	if v, ok := c.Get(key, fallback).(string); ok {
		return v
	}
	return fallback
}

// Time gets a `time.Time`
func (c *Config) Time(key string, fallback time.Time) time.Time {
	if v, ok := c.Get(key, fallback).(time.Time); ok {
		return v
	}
	return fallback
}

// Set writes a change to the config.
func (c *Config) Set(key string, value interface{}) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.m[key] = value
	c.writeMap[key] = value
	return c.write()
}

func (c *Config) write() error {
	f, err := os.Create(c.writePath)
	if err != nil {
		return errors.Wrap(err, "Lưu thiết lập")
	}

	enc := toml.NewEncoder(f)
	if err := enc.Encode(c.writeMap); err != nil {
		return errors.Wrap(err, "Lưu thiết lập")
	}

	return errors.Wrap(f.Close(), "Lưu thiết lập")
}
