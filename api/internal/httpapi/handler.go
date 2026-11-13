// Package httpapi serves the calculator over HTTP.
package httpapi

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/josuegoyret/sumthing/api/internal/calc"
	"github.com/josuegoyret/sumthing/api/internal/dictation"
)

var (
	errInvalidRequest       = errors.New("invalid request")
	errInvalidAudio         = errors.New("invalid audio")
	errDictationUnavailable = errors.New("dictation unavailable")
)

type calculateRequest struct {
	Expression string `json:"expression"`
}

type calculateResponse struct {
	Expression string `json:"expression"`
	Result     string `json:"result"`
}

type errorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type errorResponse struct {
	Error errorDetail `json:"error"`
}

type apiError struct {
	status  int
	code    string
	message string
}

// NewHandler returns the calculator API, with CORS for allowedOrigin.
// A nil dictator turns dictation off.
func NewHandler(allowedOrigin string, dictator *dictation.Dictator) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /v1/calculate", calculateHandler)
	mux.HandleFunc("POST /v1/dictate", dictateHandler(dictator))
	mux.HandleFunc("GET /healthz", healthHandler)
	return withCORS(allowedOrigin, mux)
}

func calculateHandler(w http.ResponseWriter, r *http.Request) {
	var request calculateRequest
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&request)
	hasTrailingData := !errors.Is(decoder.Decode(&struct{}{}), io.EOF)
	if err != nil || hasTrailingData || request.Expression == "" {
		writeError(w, errInvalidRequest)
		return
	}

	result, err := calc.Calculate(request.Expression)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, calculateResponse{Expression: request.Expression, Result: result})
}

func healthHandler(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func errorFor(err error) apiError {
	switch {
	case errors.Is(err, errInvalidRequest):
		return apiError{http.StatusBadRequest, "INVALID_REQUEST", "Send JSON with an expression."}
	case errors.Is(err, errInvalidAudio):
		message := fmt.Sprintf("Send an audio recording of at most %d MB.", maxAudioBytes>>20)
		return apiError{http.StatusBadRequest, "INVALID_REQUEST", message}
	case errors.Is(err, errDictationUnavailable):
		return apiError{http.StatusServiceUnavailable, "DICTATION_UNAVAILABLE", "Dictation isn't available."}
	case errors.Is(err, dictation.ErrNotUnderstood):
		return apiError{http.StatusUnprocessableEntity, "NOT_UNDERSTOOD", "Couldn't understand that. Try again."}
	case errors.Is(err, dictation.ErrFailed):
		log.Printf("dictation: %v", err)
		return apiError{http.StatusBadGateway, "DICTATION_FAILED", "Dictation failed. Try again."}
	case errors.Is(err, calc.ErrExpressionTooLong):
		message := fmt.Sprintf("The expression is longer than %d characters.", calc.MaxExpressionLength)
		return apiError{http.StatusBadRequest, "EXPRESSION_TOO_LONG", message}
	case errors.Is(err, calc.ErrInvalidExpression):
		return apiError{http.StatusBadRequest, "INVALID_EXPRESSION", "The expression is not valid."}
	case errors.Is(err, calc.ErrDivisionByZero):
		return apiError{http.StatusUnprocessableEntity, "DIVISION_BY_ZERO", "Can't divide by zero."}
	case errors.Is(err, calc.ErrExponentOutOfRange):
		return apiError{http.StatusUnprocessableEntity, "EXPONENT_OUT_OF_RANGE", "The exponent must be a whole number from 0 to 99."}
	case errors.Is(err, calc.ErrResultTooLarge):
		return apiError{http.StatusUnprocessableEntity, "RESULT_TOO_LARGE", "The result is too large."}
	default:
		return apiError{http.StatusInternalServerError, "INTERNAL", "Something went wrong. Try again."}
	}
}

func writeError(w http.ResponseWriter, err error) {
	e := errorFor(err)
	writeJSON(w, e.status, errorResponse{Error: errorDetail{Code: e.code, Message: e.message}})
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(body); err != nil {
		log.Printf("write response: %v", err)
	}
}
