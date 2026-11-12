package calc

import "math/big"

func evaluate(tokens []token) (*big.Rat, error) {
	tokens, err := withPowersFolded(tokens)
	if err != nil {
		return nil, err
	}

	sum := new(big.Rat)
	term := plainValue(tokens[0])
	for i := 1; i < len(tokens); i += 2 {
		operator, next := tokens[i].operator, tokens[i+1]
		switch operator {
		case '+', '-':
			number := plainValue(next)
			if next.isPercent {
				number = new(big.Rat).Mul(new(big.Rat).Add(sum, term), number)
			}
			sum.Add(sum, term)
			term = number
			if operator == '-' {
				term = new(big.Rat).Neg(number)
			}
		case '*':
			term = new(big.Rat).Mul(term, plainValue(next))
		case '/':
			divisor := plainValue(next)
			if divisor.Sign() == 0 {
				return nil, ErrDivisionByZero
			}
			term = new(big.Rat).Quo(term, divisor)
		}
	}
	return sum.Add(sum, term), nil
}

func withPowersFolded(tokens []token) ([]token, error) {
	folded := []token{tokens[0]}
	for i := 1; i < len(tokens); i += 2 {
		operator, next := tokens[i], tokens[i+1]
		if operator.operator != '^' {
			folded = append(folded, operator, next)
			continue
		}
		last := len(folded) - 1
		result, err := power(plainValue(folded[last]), plainValue(next))
		if err != nil {
			return nil, err
		}
		folded[last] = token{number: result}
	}
	return folded, nil
}
