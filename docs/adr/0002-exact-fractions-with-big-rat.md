# Exact fractions with `math/big.Rat`, rounded once at the end

The Go service keeps every Number as an exact fraction (`math/big.Rat`) while it evaluates an Expression. It rounds only once, when it formats the Result: at most 10 decimal places, half away from zero, with trailing zeros removed. The Result goes on the wire as a JSON string, and the frontend never rounds it again.

## Considered Options

- **`float64`.** No dependency, but `0.1+0.2` gives `0.30000000000000004`. That is the wrong habit for a payments company.
- **`shopspring/decimal`.** The usual fintech choice, but division must stop at a fixed precision, so `1÷3×3` gives `0.9999999999999999`. It is also a dependency.
- **`math/big.Rat`** (chosen). With only `+ − × ÷`, every Result is a fraction, so the calculation is always exact (`1÷3×3 = 1`, `0.1+0.2 = 0.3`). It is in the standard library and easy to explain: numerator over denominator.

## Consequences

- `Rat` has no operators, so the code uses methods (`z.Add(x, y)`, `z.Quo(x, y)`). Division by zero must be checked before `Quo`, because `Quo` panics on a zero divisor.
- Operations that have no exact fraction (`√`, `^` with a fraction exponent) will need an approximation step if we add them later.
- The 10-place limit only affects how the Result is shown. The calculation itself is exact.
