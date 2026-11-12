package httpapi

import (
	"errors"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestErrorForAnUnknownErrorIsInternal(t *testing.T) {
	got := errorFor(errors.New("unexpected"))

	assert.Equal(t, http.StatusInternalServerError, got.status)
	assert.Equal(t, "INTERNAL", got.code)
}
