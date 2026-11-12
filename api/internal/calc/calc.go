// Package calc calculates the Result of an Expression with exact fractions.
package calc

import (
	"errors"
	"unicode/utf8"
)

// MaxExpressionLength is the longest Expression, in characters, that Calculate accepts.
const MaxExpressionLength = 100

var (
	// ErrExpressionTooLong means the Expression has more than MaxExpressionLength characters.
	ErrExpressionTooLong = errors.New("expression is too long")
	// ErrInvalidExpression means the Expression does not follow the grammar.
	ErrInvalidExpression = errors.New("expression is not valid")
	// ErrDivisionByZero means the Expression divides by zero.
	ErrDivisionByZero = errors.New("division by zero")
)

// Calculate returns the Result of an Expression such as "5+16+4*5/15",
// rounded to at most 10 decimal places.
func Calculate(expression string) (string, error) {
	if utf8.RuneCountInString(expression) > MaxExpressionLength {
		return "", ErrExpressionTooLong
	}
	tokens, err := tokenize(expression)
	if err != nil {
		return "", err
	}
	result, err := evaluate(tokens)
	if err != nil {
		return "", err
	}
	return format(result), nil
}
