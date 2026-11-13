package httpapi

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/josuegoyret/sumthing/api/internal/calc"
	"github.com/josuegoyret/sumthing/api/internal/dictation"
)

const (
	maxAudioBytes    = 1 << 20
	maxFormBytes     = maxAudioBytes + 64<<10
	dictationTimeout = 20 * time.Second
	audioField       = "audio"
	screenField      = "expression"
)

type dictateResponse struct {
	Transcript string `json:"transcript"`
	Expression string `json:"expression"`
	Result     string `json:"result"`
}

func dictateHandler(dictator *dictation.Dictator) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if dictator == nil {
			writeError(w, errDictationUnavailable)
			return
		}
		r.Body = http.MaxBytesReader(w, r.Body, maxFormBytes)
		file, header, err := r.FormFile(audioField)
		if err != nil || header.Size > maxAudioBytes {
			writeError(w, errInvalidAudio)
			return
		}
		defer file.Close()

		ctx, cancel := context.WithTimeout(r.Context(), dictationTimeout)
		defer cancel()
		audio := dictation.Audio{
			Reader:      file,
			Filename:    header.Filename,
			ContentType: header.Header.Get("Content-Type"),
		}
		transcript, err := dictator.Transcript(ctx, audio)
		if err != nil {
			writeError(w, err)
			return
		}
		expression, err := dictator.Expression(ctx, transcript, r.FormValue(screenField))
		if err != nil {
			writeError(w, err)
			return
		}

		result, err := calc.Calculate(expression)
		if errors.Is(err, calc.ErrInvalidExpression) || errors.Is(err, calc.ErrExpressionTooLong) {
			err = dictation.ErrNotUnderstood
		}
		if err != nil {
			writeError(w, err)
			return
		}
		writeJSON(w, http.StatusOK, dictateResponse{Transcript: transcript, Expression: expression, Result: result})
	}
}
