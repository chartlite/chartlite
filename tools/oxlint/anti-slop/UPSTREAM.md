# anti-slop provenance

Vendored from [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop) at
commit `446268e5d15baa968eaec669ff65358d36ae6259` (2026-08-14).

The production plugin files were copied with the upstream `install-anti-slop`
skill. Chartlite owns this copy and may adapt it to the repository's standards.
See `LICENSE` for the upstream MIT license.

Local adaptation: `no-shape-in-symbol-names` permits the established
scatter-chart domain names `shape` and `pointShape`; every other symbol
containing `shape` remains rejected.

`no-runtime-typeof` uses upstream's documented `allowInTypeGuards` option.
Runtime representation checks therefore remain confined to named predicates
that establish a concrete Chartlite contract.
