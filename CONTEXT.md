# LUX

The language of the product. Terms only; how they are built lives in the code and `docs/decisions.md`.

## Language

**Product library**:
Everything the user owns, for this visit. It outlives any one investigation within it.
_Avoid_: product list, my products, inventory

## Relationships

- A **Product library** starts empty on every visit and holds only what the user adds in that visit.

## Flagged ambiguities

- "Added" meant both "in the library" and "in this check". A product in the **Product library** is owned; a product in a check is only being compared.
