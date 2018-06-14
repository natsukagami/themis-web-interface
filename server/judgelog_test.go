package server_test

import (
	"encoding/json"
	"io/ioutil"
	"testing"

	"github.com/natsukagami/themis-web-interface/server"
)

func testFile(user, problem, in, out string) func(*testing.T) {
	return func(T *testing.T) {
		log, err := server.ParseLog(in, user, problem)
		if err != nil {
			T.Fatal(err)
		}
		b, err := json.Marshal(log)
		if err != nil {
			T.Fatalf("%+v\n", err)
		}
		if err := ioutil.WriteFile(out, b, 0755); err != nil {
			T.Fatal(err)
		}
	}
}

func TestParseLog(T *testing.T) {
	T.Run("Should parse compile error log", testFile("dangcuong_123", "HIGHWAY", "test_logs/compile-error.log", "test_logs/compile-error.json"))
	T.Run("Should parse normal log", testFile("asdf0001", "LINES", "test_logs/sample-log.log", "test_logs/sample-log.json"))
	T.Run("Should parse normal log with stupid cased name", testFile("aSdF0001", "LiNeS", "test_logs/sample-log.log", "test_logs/sample-log-case.json"))
	T.Run("Should parse normal log with Vietnamese decimals", testFile("asdf0001", "LINES", "test_logs/vn-log.log", "test_logs/vn-log.json"))
}
