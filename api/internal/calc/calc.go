// Package calc calculates the Result of an Expression with exact fractions.
package calc

import (
	"errors"
	"math/big"
	"unicode/utf8"
)

const (
	// MaxExpressionLength is the longest Expression, in characters, that Calculate accepts.
	MaxExpressionLength = 100
	// MaxResultDigits is the most digits that a Result can have before the decimal point.
	MaxResultDigits = 100
)

var (
	// ErrExpressionTooLong means the Expression has more than MaxExpressionLength characters.
	ErrExpressionTooLong = errors.New("expression is too long")
	// ErrInvalidExpression means the Expression does not follow the grammar.
	ErrInvalidExpression = errors.New("expression is not valid")
	// ErrDivisionByZero means the Expression divides by zero.
	ErrDivisionByZero = errors.New("division by zero")
	// ErrExponentOutOfRange means an Exponent is not a whole number from 0 to 99.
	ErrExponentOutOfRange = errors.New("exponent is out of range")
	// ErrResultTooLarge means the Result has more than MaxResultDigits digits before the decimal point.
	ErrResultTooLarge = errors.New("result is too large")
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
	if integerDigits(result) > MaxResultDigits {
		return "", ErrResultTooLarge
	}
	return format(result), nil
}

func integerDigits(number *big.Rat) int {
	integer := new(big.Int).Quo(number.Num(), number.Denom())
	return len(integer.Abs(integer).String())
}
