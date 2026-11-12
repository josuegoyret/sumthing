package calc

import "math/big"

func evaluate(tokens []token) (*big.Rat, error) {
	stack := []*big.Rat{tokens[0].number}
	for i := 1; i < len(tokens); i += 2 {
		operator, number := tokens[i].operator, tokens[i+1].number
		last := len(stack) - 1
		switch operator {
		case '+':
			stack = append(stack, number)
		case '-':
			stack = append(stack, new(big.Rat).Neg(number))
		case '*':
			stack[last] = new(big.Rat).Mul(stack[last], number)
		case '/':
			if number.Sign() == 0 {
				return nil, ErrDivisionByZero
			}
			stack[last] = new(big.Rat).Quo(stack[last], number)
		}
	}

	sum := new(big.Rat)
	for _, number := range stack {
		sum.Add(sum, number)
	}
	return sum, nil
}
