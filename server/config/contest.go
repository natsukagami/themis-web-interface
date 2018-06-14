package config

import (
	"time"

	"github.com/natsukagami/themis-web-interface/server/expected"
	"github.com/pkg/errors"
)

// ContestConfigured returns `nil` if contest configuration is made correctly.
func (c *Config) ContestConfigured() error {
	c.mu.RLock()
	defer c.mu.RUnlock()

	if !c.Bool(ContestEnabled, false) {
		// Contest is intentionally disabled.
		return expected.New("Chức năng Contest bị vô hiệu hóa")
	}

	if c.String(ContestName, "") == "" {
		return errors.New("Tên Contest không thể rỗng")
	}
	zeroTime := time.Unix(0, 0)
	startTime := c.Time(ContestStartTime, zeroTime)
	endTime := c.Time(ContestEndTime, zeroTime)
	if startTime == zeroTime || endTime == zeroTime || startTime.After(endTime) {
		return errors.New("Thời gian contest thiết lập sai")
	}

	return nil
}
