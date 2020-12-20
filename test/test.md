## use-si-units
### Valid
- はじめくんは1 m離れた学校に向かいます。
- 点Pが10000 m/sで移動する。
- 1 Paは1 kg/(m・s^2)だ。
- 2 d 5 h 0 min 1 s。
- $3 - 2 = 1$
- 4 and 5

### Invalid
- 点Pが10000 m/secで移動する。
- はじめくんは1 M離れた学校に向かいます。

## use-si-units with options
```json
{
    allowedUnits: ['Å'],
    restrictNonSIUnits: true,
}
```

### Valid
- はじめくんは1 Å離れた学校に向かいます。
- 点Pが10000 Å/sで移動する。

### Invalid
- 2 d 5 h 0 min 1 s。
1 or 2
