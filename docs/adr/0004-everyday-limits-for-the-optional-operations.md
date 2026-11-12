# Everyday limits for the optional operations

sumthing is an everyday calculator, not a scientific one. So the optional operations follow simple limits that cover everyday use (interest, area, tips) and keep every calculation small and fast:

| Rule | Limit | Example |
|---|---|---|
| `^` | the exponent is a whole number from 0 to 99; the base is any Number | `1.05^12` = `1.795856326` |
| `√` | written right before the digits of a Number, so the Number is never negative (`√-4` is not valid) | `√2` = `1.4142135624` |
| `%` | as on a phone calculator: after `+` or `−` it is a percent of the left side; otherwise it divides by 100 | `50+10%` = `55`, `50×10%` = `5` |
| Result | at most 100 digits before the point, the same limit as the Expression | `9^99` is accepted, `99999^99` is not |

## Considered Options

- **Any exponent, with `big.Float`.** Decimal and negative exponents would be possible, but the Result of `2^0.5` is irrational, and a huge exponent (`9^99999`) can use all the server memory. Users who need `2^-3` can type `1÷2^3`.
- **A limit on the exponent alone.** It is not enough: a 100-character base to the power 99 still has thousands of digits. The Result limit closes that gap. With both limits, the largest calculation is instant, so the server can calculate first and then check the length.

## Consequences

- New errors: an Exponent outside 0 to 99, and a Result that is too large.
- The square root is the only Result that is not exact. It is calculated with much more precision than the 10 decimal places that the user sees, so `√2×√2` shows `2`.
