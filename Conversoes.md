# Lógica das Conversões de Cores

Este documento descreve os algoritmos de conversão implementados em `lib/color-conversion.ts`.

---

## Representações suportadas

| Formato | Parâmetros | Faixas |
|---------|-----------|--------|
| **RGB** | R, G, B (+ A opcional) | 0–255 (alpha 0–1) |
| **HSL** | H, S, L | H: 0–360°, S/L: 0–100% |
| **HSV** | H, S, V | H: 0–360°, S/V: 0–100% |
| **CMYK** | C, M, Y, K | 0–100% |
| **HEX** | #RRGGBB ou #RRGGBBAA | Hexadecimal |

---

## RGB → HSL

1. Normaliza R, G, B para o intervalo [0, 1].
2. Calcula `max` e `min` dos três canais e `delta = max - min`.
3. **Luminosidade**: `L = (max + min) / 2`
4. **Saturação**:
   - Se `delta = 0`: `S = 0` (cinza)
   - Se `L ≤ 0.5`: `S = delta / (max + min)`
   - Se `L > 0.5`: `S = delta / (2 − max − min)`
5. **Matiz**:
   - Se `max = R`: `H = (G−B)/delta mod 6`
   - Se `max = G`: `H = (B−R)/delta + 2`
   - Se `max = B`: `H = (R−G)/delta + 4`
   - Multiplica por 60° para obter graus.

$$H \in [0°, 360°], \quad S \in [0, 1], \quad L \in [0, 1]$$

---

## HSL → RGB

1. Se `S = 0`, a cor é acromática: `R = G = B = L × 255`.
2. Calcula variáveis auxiliares:
   - `q = L < 0.5 ? L(1+S) : L + S − LS`
   - `p = 2L − q`
3. Usa a função `hue2rgb(p, q, t)` para cada canal:

$$\text{hue2rgb}(p, q, t) = \begin{cases} p + (q-p) \cdot 6t & t < \tfrac{1}{6} \\ q & t < \tfrac{1}{2} \\ p + (q-p)({\tfrac{2}{3}}-t) \cdot 6 & t < \tfrac{2}{3} \\ p & \text{caso contrário} \end{cases}$$

4. `R = hue2rgb(p, q, H/360 + 1/3)`, `G = hue2rgb(p, q, H/360)`, `B = hue2rgb(p, q, H/360 − 1/3)`.

---

## RGB → HSV

1. Normaliza R, G, B para [0, 1].
2. `max = max(R, G, B)`, `min = min(R, G, B)`, `delta = max − min`.
3. **Valor**: `V = max`
4. **Saturação**: `S = delta / max` (ou 0 se `max = 0`)
5. **Matiz**: mesma fórmula do caso RGB → HSL (etapa 5).

$$V = \max(R,G,B), \quad S = \frac{\max - \min}{\max}$$

---

## HSV → RGB

1. Divide `H` por 60 para obter o setor `i` (0–5).
2. Calcula:
   - `C = V × S` (croma)
   - `X = C × (1 − |i \bmod 2 − 1|)`
   - `m = V − C`
3. Seleciona `(R', G', B')` de acordo com o setor:

| Setor i | R' | G' | B' |
|---------|----|----|-----|
| 0 | C | X | 0 |
| 1 | X | C | 0 |
| 2 | 0 | C | X |
| 3 | 0 | X | C |
| 4 | X | 0 | C |
| 5 | C | 0 | X |

4. `R = (R' + m) × 255`, idem para G e B.

---

## RGB → CMYK

1. Normaliza R, G, B para [0, 1].
2. `K = 1 − max(R, G, B)`
3. Se `K = 1` (preto puro): `C = M = Y = 0`.
4. Caso contrário:

$$C = \frac{1 - R - K}{1 - K}, \quad M = \frac{1 - G - K}{1 - K}, \quad Y = \frac{1 - B - K}{1 - K}$$

---

## CMYK → RGB

$$R = 255 \cdot (1-C)(1-K), \quad G = 255 \cdot (1-M)(1-K), \quad B = 255 \cdot (1-Y)(1-K)$$

---

## RGB ↔ Hexadecimal

- **RGB → HEX**: cada canal é convertido para dois dígitos hexadecimais com `toString(16).padStart(2, '0')`. Alpha (0–1) é multiplicado por 255 antes da conversão.
- **HEX → RGB**: suporta `#RGB` (3 dígitos, expandido), `#RRGGBB` (6 dígitos) e `#RRGGBBAA` (8 dígitos, alpha = AA/255).

---

## Parsing de strings

O módulo inclui parsers para strings CSS coladas pelo usuário:

| Função | Exemplo de entrada |
|--------|--------------------|
| `parseRGBString` | `rgb(255, 0, 0)` ou `rgba(255,0,0,0.5)` |
| `parseHSLString` | `hsl(0, 100%, 50%)` |
| `parseHSVString` | `hsv(0, 100%, 100%)` |
| `parseCMYKString` | `cmyk(0%, 100%, 100%, 0%)` |

Cada função usa uma expressão regular e valida os intervalos antes de retornar o objeto tipado ou `null`.

---

## Fluxo de dados no estado global

```
Usuário altera qualquer campo
        │
        ▼
 updateFromXXX(novoValor)
        │
        ▼
 hsvToRGB / hslToRGB / cmykToRGB  (se necessário)
        │
        ▼
 deriveAllFromRGB(rgb, includeAlpha)
   → rgb, cmyk, hsl, hsv, hex recalculados
        │
        ▼
 Estado React atualizado → todos os componentes re-renderizam
```

Toda a conversão passa pelo RGB como formato intermediário canônico.

---

## Notas sobre precisão

- Todos os valores intermediários são mantidos em ponto flutuante; apenas na saída (interface) são arredondados com `Math.round`.
- Conversões de ida-e-volta (RGB → HSL → RGB) podem ter diferença de ±1 nas componentes devida ao arredondamento final.
- O canvas do seletor usa `hsl()` nativo do navegador, garantindo correspondência visual com os valores calculados.
