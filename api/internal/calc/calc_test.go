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
