# MongoDB Production Dump — Noir Hamburg FARM Reference

**Purpose:** Full database export from the original FARM project, to be restored into the new farmnext (Next.js) job during migration.

**Format:** Raw `mongodump` BSON files (unarchived — `.tar.gz` was blocked by the repo's `.gitignore`).
**Location:** `db_export/noir_hamburg/` — one `.bson` + `.metadata.json` pair per collection.
**Source DB name:** `noir_hamburg`
**Total size:** ~320 KB

## Collections and counts (source of truth)

| Collection | Count | Notes |
|---|---|---|
| `users` | 1 | Single admin (bcrypt-hashed password). Email `admin@noir-hamburg.de`. |
| `models` | 14 | Full model roster with gallery URLs. |
| `blog` | 13 | Blog posts. **Note collection name is `blog`, not `blog_posts`.** |
| `pages` | 3 | Custom CMS pages under `/p/[slug]`. |
| `service_content` | 8 | Per-service SEO/content docs. |
| `area_content` | 18 | Per-Hamburg-area SEO/content docs. |
| `site_settings` | 1 | Global site config. **Note name is `site_settings`, not `settings`.** |
| `contacts` | 80 | Contact form submissions inbox. |
| `files` | 72 | Uploaded media metadata. **Note name is `files`, not `media`.** |
| `content_migrations` | 2 | Migration markers — do not delete. |

## Restore instructions (for the new farmnext agent)

From the new farmnext project's terminal:

```bash
# 1. Locate the dump (already unarchived in the reference repo)
ls /app/_reference/db_export/noir_hamburg/   # should list all .bson files

# 2. Read target DB config from the new project's .env
#    (MONGO_URL and DB_NAME are already set by the platform)

# 3. Restore into the current MongoDB (drops existing same-named collections)
mongorestore --uri="$MONGO_URL" \
  --nsFrom="noir_hamburg.*" --nsTo="${DB_NAME}.*" \
  --drop /app/_reference/db_export/noir_hamburg

# 4. Verify counts match the table above
mongosh "$MONGO_URL" --eval '
  const target = db.getSiblingDB(process.env.DB_NAME);
  ["users","models","blog","pages","service_content","area_content",
   "site_settings","contacts","files","content_migrations"]
    .forEach(c => print(c + ": " + target[c].countDocuments()));
'
```

If `mongosh` is not available, verify via a Node.js one-liner using the same driver the app uses.

## Critical collection-name reminders

The new Next.js route handlers **must** query these exact collection names (they differ from typical conventions):

- Blog posts → collection `blog` (NOT `blog_posts`)
- Site settings → collection `site_settings` (NOT `settings`)
- Media files → collection `files` (NOT `media`)

If the new agent's code uses the "cleaner" names, the admin panel and public pages will read/write to empty collections and the site will appear broken even though the data is there.

## Admin credentials

- Email: `admin@noir-hamburg.de`
- Password: `NoirAdmin2026!`

Do **not** re-seed the admin user — the real one is in the restored `users` collection with the correct bcrypt hash. Re-seeding would overwrite it and could break login.
