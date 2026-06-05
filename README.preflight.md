# Trae Preflight

This folder is prepared for `wangxt-757-1`.

Use `.env` for stable local ports and compose project identity:

- APP_PORT: 18057
- API_PORT: 19057
- WEB_PORT: 20057
- DB_PORT: 21057
- REDIS_PORT: 22057

Smoke entry:

```bash
bash scripts/smoke.sh
```

The preflight files are environment scaffolding only. The generated business
project can replace or extend them when needed.
