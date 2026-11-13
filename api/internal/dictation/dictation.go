// Package dictation turns a spoken recording into an Expression with OpenAI.
// It never calculates: the caller sends the Expression to calc (ADR 0005).
package dictation

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"
	"github.com/openai/openai-go/v3/responses"
	"github.com/openai/openai-go/v3/shared"
)

const (
	transcriptionModel = openai.AudioModelGPT4oMiniTranscribe
	expressionModel    = openai.ChatModelGPT5_4Mini
	language           = "en"
	schemaName         = "calculator_expression"
)

const instructions = `You turn spoken words into an Expression for an everyday calculator.

Grammar (no spaces):
Expression := Number (Operator Number)*
Number     := ['-'] ['√'] digits ['.' digits] ['%']
Operator   := '+' | '-' | '*' | '/' | '^'

Rules:
- Use only digits, '.', '+', '-', '*', '/', '^', '√' and '%'. No spaces, letters, commas or parentheses.
- Never calculate anything. Write the numbers and operators in the order they are spoken.
- The number after '^' is a whole number from 0 to 99. "squared" is "^2", "cubed" is "^3". Never chain '^', as in 2^3^2.
- "square root of nine" is "√9". The square root applies to one number only.
- "fifteen percent of eighty" is "15%*80". "eighty plus fifteen percent" is "80+15%".
- At most 100 characters.
- Screen is what the calculator shows now. If the words continue it ("times two", "plus five"), start the Expression with Screen exactly as it is. Otherwise, start a new Expression.
- If the words are not a calculation, or need grouping such as "five plus three, all times two", return an empty expression.

Examples (Screen | Words -> expression):
- "" | "fifteen percent of eighty" -> "15%*80"
- "" | "what's twelve times seven" -> "12*7"
- "" | "one thousand two hundred divided by four" -> "1200/4"
- "" | "three point five plus two and a half" -> "3.5+2.5"
- "" | "minus eight times three" -> "-8*3"
- "" | "nine squared plus four cubed" -> "9^2+4^3"
- "" | "square root of eighty one" -> "√81"
- "" | "one point oh five to the power of twelve" -> "1.05^12"
- "" | "fifty dollars plus a twenty percent tip" -> "50+20%"
- "28" | "times two" -> "28*2"
- "28" | "minus ten percent" -> "28-10%"
- "28" | "seven plus one" -> "7+1"
- "12+" | "five" -> "12+5"
- "" | "five plus three, all times two" -> ""
- "" | "what's the weather today" -> ""`

var expressionSchema = map[string]any{
	"type": "object",
	"properties": map[string]any{
		"expression": map[string]any{"type": "string"},
	},
	"required":             []string{"expression"},
	"additionalProperties": false,
}

var (
	// ErrNotUnderstood means the words did not give an Expression.
	ErrNotUnderstood = errors.New("dictation not understood")
	// ErrFailed means an OpenAI call failed.
	ErrFailed = errors.New("dictation failed")
)

// Audio is a recording from the browser.
type Audio struct {
	Reader      io.Reader
	Filename    string
	ContentType string
}

// Dictator calls OpenAI for the Transcript and the Expression.
type Dictator struct {
	client openai.Client
}

// New returns a Dictator that uses the OpenAI API key.
func New(apiKey string) *Dictator {
	return &Dictator{client: openai.NewClient(option.WithAPIKey(apiKey))}
}

// Transcript returns the words spoken in the audio.
func (d *Dictator) Transcript(ctx context.Context, audio Audio) (string, error) {
	transcription, err := d.client.Audio.Transcriptions.New(ctx, openai.AudioTranscriptionNewParams{
		File:     openai.File(audio.Reader, audio.Filename, audio.ContentType),
		Model:    transcriptionModel,
		Language: openai.String(language),
	})
	if err != nil {
		return "", fmt.Errorf("%w: transcribe: %w", ErrFailed, err)
	}
	if transcription.Text == "" {
		return "", ErrNotUnderstood
	}
	return transcription.Text, nil
}

// Expression returns the Expression for the Transcript. Screen is what the
// calculator shows now, so the words can continue it.
func (d *Dictator) Expression(ctx context.Context, transcript, screen string) (string, error) {
	response, err := d.client.Responses.New(ctx, responses.ResponseNewParams{
		Model:        expressionModel,
		Instructions: openai.String(instructions),
		Input: responses.ResponseNewParamsInputUnion{
			OfString: openai.String(fmt.Sprintf("Screen: %s\nWords: %s", screen, transcript)),
		},
		Reasoning: shared.ReasoningParam{Effort: shared.ReasoningEffortLow},
		Store:     openai.Bool(false),
		Text: responses.ResponseTextConfigParam{
			Format: responses.ResponseFormatTextConfigUnionParam{
				OfJSONSchema: &responses.ResponseFormatTextJSONSchemaConfigParam{
					Name:   schemaName,
					Schema: expressionSchema,
					Strict: openai.Bool(true),
				},
			},
		},
	})
	if err != nil {
		return "", fmt.Errorf("%w: expression: %w", ErrFailed, err)
	}

	var answer struct {
		Expression string `json:"expression"`
	}
	if err := json.Unmarshal([]byte(response.OutputText()), &answer); err != nil {
		return "", fmt.Errorf("%w: decode expression: %w", ErrFailed, err)
	}
	if answer.Expression == "" {
		return "", ErrNotUnderstood
	}
	return answer.Expression, nil
}
