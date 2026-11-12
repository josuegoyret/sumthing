package calc

import (
	"math/big"
	"strings"
)

const squareRootSign = "√"

type token struct {
	number    *big.Rat
	isPercent bool
	operator  byte
}

func (t token) isOperator() bool {
	return t.operator != 0
}

func isDigit(character byte) bool {
	return character >= '0' && character <= '9'
}

func isOperator(character byte) bool {
	return character == '+' || character == '-' || character == '*' || character == '/' || character == '^'
}

func expectsNumber(tokens []token) bool {
	return len(tokens) == 0 || tokens[len(tokens)-1].isOperator()
}

func startsNumber(expression string, i int, tokens []token) bool {
	character := expression[i]
	return isDigit(character) ||
		strings.HasPrefix(expression[i:], squareRootSign) ||
		(character == '-' && expectsNumber(tokens))
}

func tokenize(expression string) ([]token, error) {
	var tokens []token
	for i := 0; i < len(expression); {
		character := expression[i]
		switch {
		case character == ' ':
			i++
		case startsNumber(expression, i, tokens):
			number, end, err := readNumber(expression, i)
			if err != nil {
				return nil, err
			}
			tokens = append(tokens, number)
			i = end
		case isOperator(character):
			tokens = append(tokens, token{operator: character})
			i++
		default:
			return nil, ErrInvalidExpression
		}
	}
	if !hasValidShape(tokens) {
		return nil, ErrInvalidExpression
	}
	return tokens, nil
}

func readDigits(expression string, start int) int {
	end := start
	for end < len(expression) && isDigit(expression[end]) {
		end++
	}
	return end
}

func readNumber(expression string, start int) (token, int, error) {
	digitsStart := start
	isNegative := expression[digitsStart] == '-'
	if isNegative {
		digitsStart++
	}
	isSquareRoot := strings.HasPrefix(expression[digitsStart:], squareRootSign)
	if isSquareRoot {
		digitsStart += len(squareRootSign)
	}

	end := readDigits(expression, digitsStart)
	if end == digitsStart {
		return token{}, 0, ErrInvalidExpression
	}
	if end < len(expression) && expression[end] == '.' {
		fractionStart := end + 1
		end = readDigits(expression, fractionStart)
		if end == fractionStart {
			return token{}, 0, ErrInvalidExpression
		}
	}
	number, ok := new(big.Rat).SetString(expression[digitsStart:end])
	if !ok {
		return token{}, 0, ErrInvalidExpression
	}

	if isSquareRoot {
		number = squareRoot(number)
	}
	if isNegative {
		number.Neg(number)
	}
	isPercent := end < len(expression) && expression[end] == '%'
	if isPercent {
		end++
	}
	return token{number: number, isPercent: isPercent}, end, nil
}

func hasValidShape(tokens []token) bool {
	if len(tokens)%2 == 0 {
		return false
	}
	for i, t := range tokens {
		wantsOperator := i%2 == 1
		if t.isOperator() != wantsOperator {
			return false
		}
		isPowerChain := t.operator == '^' && i+2 < len(tokens) && tokens[i+2].operator == '^'
		if isPowerChain {
			return false
		}
	}
	return true
}
