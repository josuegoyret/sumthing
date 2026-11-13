package httpapi_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/josuegoyret/sumthing/api/internal/httpapi"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const testOrigin = "http://localhost:5173"

func send(method, path, body string) *httptest.ResponseRecorder {
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(method, path, strings.NewReader(body))
	httpapi.NewHandler(testOrigin, nil).ServeHTTP(recorder, request)
	return recorder
}

func TestCalculateReturnsTheResult(t *testing.T) {
	response := send(http.MethodPost, "/v1/calculate", `{"expression":"2 + 3*4"}`)

	assert.Equal(t, http.StatusOK, response.Code)
	assert.Equal(t, "application/json", response.Header().Get("Content-Type"))
	assert.JSONEq(t, `{"expression":"2 + 3*4","result":"14"}`, response.Body.String())
}

func TestCalculateReturnsAnError(t *testing.T) {
	tests := []struct {
		name   string
		body   string
		status int
		code   string
	}{
		{"when the body is not JSON", `nope`, http.StatusBadRequest, "INVALID_REQUEST"},
		{"when the JSON has trailing data", `{"expression":"1+1"} nope`, http.StatusBadRequest, "INVALID_REQUEST"},
		{"when the body has a second JSON value", `{"expression":"1+1"}{"expression":"2"}`, http.StatusBadRequest, "INVALID_REQUEST"},
		{"when the expression is missing", `{}`, http.StatusBadRequest, "INVALID_REQUEST"},
		{"when the expression is empty", `{"expression":""}`, http.StatusBadRequest, "INVALID_REQUEST"},
		{"when the expression is too long", `{"expression":"` + strings.Repeat("1", 101) + `"}`, http.StatusBadRequest, "EXPRESSION_TOO_LONG"},
		{"when the expression is not valid", `{"expression":"5++3"}`, http.StatusBadRequest, "INVALID_EXPRESSION"},
		{"when it divides by zero", `{"expression":"5/0"}`, http.StatusUnprocessableEntity, "DIVISION_BY_ZERO"},
		{"when the Exponent is out of range", `{"expression":"2^100"}`, http.StatusUnprocessableEntity, "EXPONENT_OUT_OF_RANGE"},
		{"when the Result is too large", `{"expression":"99999^99"}`, http.StatusUnprocessableEntity, "RESULT_TOO_LARGE"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response := send(http.MethodPost, "/v1/calculate", tt.body)

			var body struct {
				Error struct {
					Code    string `json:"code"`
					Message string `json:"message"`
				} `json:"error"`
			}
			require.NoError(t, json.Unmarshal(response.Body.Bytes(), &body))
			assert.Equal(t, tt.status, response.Code)
			assert.Equal(t, tt.code, body.Error.Code)
			assert.NotEmpty(t, body.Error.Message)
		})
	}
}

func TestEveryResponseAllowsTheOrigin(t *testing.T) {
	response := send(http.MethodPost, "/v1/calculate", `{"expression":"1+1"}`)

	assert.Equal(t, testOrigin, response.Header().Get("Access-Control-Allow-Origin"))
}

func TestPreflightReturnsNoContent(t *testing.T) {
	response := send(http.MethodOptions, "/v1/calculate", "")

	assert.Equal(t, http.StatusNoContent, response.Code)
	assert.Equal(t, testOrigin, response.Header().Get("Access-Control-Allow-Origin"))
	assert.Equal(t, "POST", response.Header().Get("Access-Control-Allow-Methods"))
	assert.Equal(t, "Content-Type", response.Header().Get("Access-Control-Allow-Headers"))
	assert.Empty(t, response.Body.String())
}

func TestHealthReturnsOK(t *testing.T) {
	response := send(http.MethodGet, "/healthz", "")

	assert.Equal(t, http.StatusOK, response.Code)
	assert.JSONEq(t, `{"status":"ok"}`, response.Body.String())
}
