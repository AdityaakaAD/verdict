# Seed data

## scenarios.sql

200 placeholder scenarios distributed across all 12 categories, mostly evergreen with a topical/seasonal sprinkle. All four label/meaning fields are populated and scenario-specific per spec section 12.

These are **dev placeholders**. The founder will provide a finalized 200-scenario file before Phase 4 — load it via `scripts/import-scenarios.ts` (Phase 4).

To apply:

```bash
# via supabase CLI
supabase db reset            # rebuilds schema from migrations + runs this seed

# or directly
psql "$DATABASE_URL" -f supabase/seed/scenarios.sql
```

## Importer (Phase 4 deliverable)

`scripts/import-scenarios.ts` accepts a JSON file with the shape:

```json
[
  {
    "text": "…",
    "question": "Was X justified?",
    "context_tag": "Medicine · Ethics",
    "side_a_label": "Justified",
    "side_b_label": "Not justified",
    "side_a_meaning": "She had the right to refuse.",
    "side_b_meaning": "Her oath came before her past.",
    "category": "health_medicine",
    "freshness_tier": "evergreen",
    "region_locked": []
  }
]
```

It upserts on a content hash of `text`, marks placeholders as `is_active=false`, and reports the diff.
