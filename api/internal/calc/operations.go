package calc

import "math/big"

const (
	maxExponent         = 99
	percentBase         = 100
	squareRootPrecision = 512
)

func power(base, exponent *big.Rat) (*big.Rat, error) {
	isWholeInRange := exponent.IsInt() && exponent.Sign() >= 0 &&
		exponent.Cmp(big.NewRat(maxExponent, 1)) <= 0
	if !isWholeInRange {
		return nil, ErrExponentOutOfRange
	}
	numerator := new(big.Int).Exp(base.Num(), exponent.Num(), nil)
	denominator := new(big.Int).Exp(base.Denom(), exponent.Num(), nil)
	return new(big.Rat).SetFrac(numerator, denominator), nil
}

func squareRoot(number *big.Rat) *big.Rat {
	root := new(big.Float).SetPrec(squareRootPrecision).SetRat(number)
	result, _ := root.Sqrt(root).Rat(nil)
	return result
}

func plainValue(t token) *big.Rat {
	if !t.isPercent {
		return t.number
	}
	return new(big.Rat).Quo(t.number, big.NewRat(percentBase, 1))
}
