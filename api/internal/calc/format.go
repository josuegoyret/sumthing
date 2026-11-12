package calc

import (
	"math/big"
	"strings"
)

const decimalPlaces = 10

func format(result *big.Rat) string {
	text := result.FloatString(decimalPlaces)
	text = strings.TrimRight(text, "0")
	text = strings.TrimSuffix(text, ".")
	if text == "-0" {
		return "0"
	}
	return text
}
