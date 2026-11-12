package calc

import "math/big"

type token struct {
	number   *big.Rat
	operator byte
}

func (t token) isOperator() bool {
	return t.operator != 0
}

func isDigit(character byte) bool {
	return character >= '0' && character <= '9'
}

func isOperator(character byte) bool {
	return character == '+' || character == '-' || character == '*' || character == '/'
}

func expectsNumber(tokens []token) bool {
	return len(tokens) == 0 || tokens[len(tokens)-1].isOperator()
}

func tokenize(expression string) ([]token, error) {
	var tokens []token
	for i := 0; i < len(expression); {
		character := expression[i]
		switch {
		case character == ' ':
			i++
		case isDigit(character) || (character == '-' && expectsNumber(tokens)):
			number, end, err := readNumber(expression, i)
			if err != nil {
				return nil, err
			}
			tokens = append(tokens, token{number: number})
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

func readNumber(expression string, start int) (*big.Rat, int, error) {
	integerStart := start
	if expression[start] == '-' {
		integerStart++
	}
	end := readDigits(expression, integerStart)
	if end == integerStart {
		return nil, 0, ErrInvalidExpression
	}
	if end < len(expression) && expression[end] == '.' {
		fractionStart := end + 1
		end = readDigits(expression, fractionStart)
		if end == fractionStart {
			return nil, 0, ErrInvalidExpression
		}
	}
	number, ok := new(big.Rat).SetString(expression[start:end])
	if !ok {
		return nil, 0, ErrInvalidExpression
	}
	return number, end, nil
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
	}
	return true
}
