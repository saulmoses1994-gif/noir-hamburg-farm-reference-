# MongoDB Production Dump — Noir Hamburg FARM Reference

**Purpose:** Full database export from the original FARM project, to be restored into the new farmnext (Next.js) job during migration.

**File:** `mongo_dump.tar.gz` (~73 KB compressed, ~316 KB uncompressed)
**Source DB:** `noir_hamburg`
**Dump tool:** `mongodump` (standard BSON format)

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
# 1. Extract the archive
cd /tmp
tar -xzf /app/_reference/db_export/mongo_dump.tar.gz

# 2. Read target DB config from .env
source /app/.env   # or however the new project exposes MONGO_URL / DB_NAME

# 3. Restore into the current MongoDB (drops existing collections of the same name)
mongorestore --uri="$MONGO_URL" --nsFrom="noir_hamburg.*" --nsTo="${DB_NAME}.*" --drop /tmp/noir_hamburg

# 4. Verify counts match the table above
mongosh "$MONGO_URL" --eval '
  const db = db.getSiblingDB(process.env.DB_NAME || "noir_hamburg");
  ["users","models","blog","pages","service_content","area_content","site_settings","contacts","files","content_migrations"]
    .forEach(c => print(c + ": " + db[c].countDocuments()));
'
```

## Critical collection-name reminders

The new Next.js route handlers **must** query these exact collection names (they differ from typical conventions):

- Blog posts → collection `blog` (NOT `blog_posts`)
- Site settings → collection `site_settings` (NOT `settings`)
- Media files → collection `files` (NOT `media`)

If the new agent's code uses the "cleaner" names, the admin panel and public pages will read/write to empty collections and the site will appear broken even though the data is there.

## Admin credentials

- Email: `admin@noir-hamburg.de`
- Password: `NoirAdmin2026!`

(These match the hashed password stored in the `users` collection dump — do NOT re-seed the admin user; use the one restored from the dump.)
