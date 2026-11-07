# LUX

The language of the product. Terms only; how they are built lives in the code and `docs/decisions.md`.

## Language

**Product library**:
Everything the user owns. It outlives any one investigation.
_Avoid_: product list, my products, inventory

**Seeded library**:
The five demo products a visitor's Product library shows until they change it.
_Avoid_: demo products, default products

**Untouched library**:
A Product library the user has never changed, so it still shows the Seeded library. An emptied library is not untouched: it is theirs, and empty.

**Library start**:
What an Untouched library means to the screen changing it: seeded on every screen except step 5, which starts empty so the user can watch the list sort itself.

## Relationships

- A **Product library** is either **Untouched** or the user's own.
- Adding from a seeded **Library start** makes the **Seeded library** the user's own, with the new product beside it.

## Flagged ambiguities

- "Added" meant both "in the library" and "in this check". A product in the **Product library** is owned; a product in a check is only being compared.
