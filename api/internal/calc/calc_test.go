package calc_test

import (
	"strings"
	"testing"

	"github.com/josuegoyret/sumthing/api/internal/calc"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCalculate(t *testing.T) {
	tests := []struct {
		name       string
		expression string
		want       string
		wantErr    error
	}{
		{name: "returns a single Number", expression: "5", want: "5"},
		{name: "adds", expression: "2+3", want: "5"},
		{name: "ignores spaces", expression: " 2 + 3 ", want: "5"},
		{name: "subtracts below zero", expression: "9-12", want: "-3"},
		{name: "multiplies decimals", expression: "4*2.5", want: "10"},
		{name: "divides to a decimal", expression: "10/4", want: "2.5"},
		{name: "multiplies before adding", expression: "2+3*4", want: "14"},
		{name: "follows precedence left to right", expression: "5+16+4*5/15", want: "22.3333333333"},
		{name: "adds decimals exactly", expression: "0.1+0.2", want: "0.3"},
		{name: "keeps fractions exact until the end", expression: "1/3*3", want: "1"},
		{name: "stops at 10 decimal places", expression: "10/3", want: "3.3333333333"},
		{name: "rounds the last place", expression: "2/3", want: "0.6666666667"},
		{name: "removes trailing zeros", expression: "5.50*2", want: "11"},
		{name: "accepts leading zeros", expression: "007+1", want: "8"},
		{name: "starts with a negative Number", expression: "-3+1", want: "-2"},
		{name: "multiplies by a negative Number", expression: "2*-3", want: "-6"},
		{name: "subtracts a negative Number", expression: "5--3", want: "8"},
		{name: "divides zero", expression: "0/5", want: "0"},
		{name: "never returns negative zero", expression: "-1*0", want: "0"},
		{name: "rounds a tiny negative to zero", expression: "-0.00000000001", want: "0"},
		{name: "accepts exactly 100 characters", expression: strings.Repeat("1+", 49) + "11", want: "60"},

		{name: "raises to a power", expression: "2^10", want: "1024"},
		{name: "raises a decimal to a power", expression: "1.05^12", want: "1.795856326"},
		{name: "raises to the power 0", expression: "2^0", want: "1"},
		{name: "raises before multiplying", expression: "2*3^2", want: "18"},
		{name: "accepts a Result of 95 digits", expression: "9^99", want: "29512665430652752148753480226197736314359272517043832886063884637676943433478020332709411004889"},
		{name: "takes a square root", expression: "√9", want: "3"},
		{name: "rounds an irrational square root", expression: "√2", want: "1.4142135624"},
		{name: "keeps square roots precise", expression: "√2*√2", want: "2"},
		{name: "adds a square root", expression: "2+√9", want: "5"},
		{name: "negates a square root", expression: "-√9", want: "-3"},
		{name: "divides a lone Percent by 100", expression: "50%", want: "0.5"},
		{name: "adds a Percent of the left side", expression: "50+10%", want: "55"},
		{name: "subtracts a Percent of the left side", expression: "50-10%", want: "45"},
		{name: "takes a Percent of everything on the left", expression: "5+50+10%", want: "60.5"},
		{name: "multiplies by a Percent", expression: "50*10%", want: "5"},
		{name: "divides by a Percent", expression: "200/50%", want: "400"},

		{name: "rejects a division by zero", expression: "5/0", wantErr: calc.ErrDivisionByZero},
		{name: "rejects a zero divisor in the middle", expression: "1+2/0*3", wantErr: calc.ErrDivisionByZero},
		{name: "rejects 101 characters", expression: strings.Repeat("1", 101), wantErr: calc.ErrExpressionTooLong},
		{name: "rejects only spaces", expression: "   ", wantErr: calc.ErrInvalidExpression},
		{name: "rejects a trailing Operator", expression: "5+", wantErr: calc.ErrInvalidExpression},
		{name: "rejects a leading plus", expression: "+5", wantErr: calc.ErrInvalidExpression},
		{name: "rejects two Operators", expression: "5++3", wantErr: calc.ErrInvalidExpression},
		{name: "rejects two points", expression: "2..3", wantErr: calc.ErrInvalidExpression},
		{name: "rejects a leading point", expression: ".5", wantErr: calc.ErrInvalidExpression},
		{name: "rejects a trailing point", expression: "5.", wantErr: calc.ErrInvalidExpression},
		{name: "rejects letters", expression: "abc", wantErr: calc.ErrInvalidExpression},
		{name: "rejects a double minus", expression: "--3", wantErr: calc.ErrInvalidExpression},
		{name: "rejects a triple minus", expression: "5---3", wantErr: calc.ErrInvalidExpression},
		{name: "rejects a hexadecimal Number", expression: "0x1A", wantErr: calc.ErrInvalidExpression},
		{name: "rejects two Numbers", expression: "2 3", wantErr: calc.ErrInvalidExpression},
		{name: "rejects a decimal Exponent", expression: "2^0.5", wantErr: calc.ErrExponentOutOfRange},
		{name: "rejects a negative Exponent", expression: "2^-3", wantErr: calc.ErrExponentOutOfRange},
		{name: "rejects an Exponent over 99", expression: "2^100", wantErr: calc.ErrExponentOutOfRange},
		{name: "rejects a chain of powers", expression: "2^3^2", wantErr: calc.ErrInvalidExpression},
		{name: "rejects a Result over 100 digits", expression: "99999^99", wantErr: calc.ErrResultTooLarge},
		{name: "rejects a square root of a negative Number", expression: "√-4", wantErr: calc.ErrInvalidExpression},
		{name: "rejects a lone square root", expression: "√", wantErr: calc.ErrInvalidExpression},
		{name: "rejects a square root after a Number", expression: "5√", wantErr: calc.ErrInvalidExpression},
		{name: "rejects two Percents", expression: "10%%", wantErr: calc.ErrInvalidExpression},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := calc.Calculate(tt.expression)

			if tt.wantErr != nil {
				assert.ErrorIs(t, err, tt.wantErr)
				return
			}
			require.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}
