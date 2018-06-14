package serve

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/natsukagami/themis-web-interface/server/expected"
	"github.com/pkg/errors"
)

// Error returns the error in the Response.
// If the error is expected, returns with status code `expectedStatus`,
// else returns with a 500.
func Error(w http.ResponseWriter, err error, expectedStatus int) {
	if expected.Check(err) {
		ErrorCode(w, err, expectedStatus)
	} else {
		Unexpected(w, err)
	}
}

// Unexpected prints the error and returns a 500.
func Unexpected(w http.ResponseWriter, err error) {
	log.Printf("%+v\n", err)
	ErrorCode(w, err, 500)
}

// BadRequest makes a response with status code 400.
func BadRequest(w http.ResponseWriter, err error) {
	ErrorCode(w, err, 400)
}

// ErrorCode writes the error with a statusCode to a HTTP response writer.
func ErrorCode(w http.ResponseWriter, err error, statusCode int) {
	err = writeJSON(w, err.Error(), statusCode)
	if err != nil {
		// Ummm, just panic
		panic(err)
	}
}

// Reply sends back the data to the HTTP response.
func Reply(w http.ResponseWriter, data interface{}) {
	err := writeJSON(w, data, 200)
	if err != nil {
		// Ummm, just panic
		panic(err)
	}
}

// Writes the response to an interface as a JSON representation.
func writeJSON(w http.ResponseWriter, data interface{}, statusCode int) error {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(statusCode)
	b, err := json.Marshal(data)
	if err != nil {
		return errors.Wrap(err, "Trả về")
	}
	_, err = w.Write(b)
	if err != nil {
		return errors.Wrap(err, "Trả về")
	}
	return nil
}
