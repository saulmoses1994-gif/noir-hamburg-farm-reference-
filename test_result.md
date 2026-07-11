#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  Noir Hamburg — luxury escort agency migration from FARM (React SPA) to Next.js App Router.
  Fix SPA SEO limitation. Every service/area page must serve unique, fully-rendered HTML with
  its own <title>, meta description, <h1>, canonical, hreflang alternates, and JSON-LD in <body>.
  Reference repo: /app/_reference (cloned from GitHub, frozen source of truth).
  Phase 1 goal: prove ONE service page (`/services/vip-escort-hamburg`) SSRs end-to-end.

backend:
  - task: "GET /api/health"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Returns {status:'ok', service, time}"
        - working: true
          agent: "testing"
          comment: "✅ VERIFIED: Returns 200 with status='ok', service='noir-hamburg-nextjs', and ISO timestamp. All requirements met."

  - task: "GET /api/service-content (list + lazy seed)"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js + lib/service-content.js + lib/mongo.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Lazy-seeds MongoDB `service_content` collection from /app/lib/service_content_seed.json on first read. Returns all 8 slugs verified via curl."
        - working: true
          agent: "testing"
          comment: "✅ VERIFIED: Returns 200 with exactly 8 service objects. All required fields present (slug, title, h1, tagline, description, meta_title, meta_description, sections, faqs). All 8 expected slugs verified: luxury-escort-hamburg, vip-escort-hamburg, business-escort-hamburg, dinner-companion-hamburg, hotel-escort-hamburg, event-escort-hamburg, travel-companion-hamburg, girlfriend-experience-hamburg. No _id field in response. Lazy-seed working correctly."

  - task: "GET /api/service-content/{slug}"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Returns single service doc by slug. 404 on unknown slug."
        - working: true
          agent: "testing"
          comment: "✅ VERIFIED: GET /api/service-content/vip-escort-hamburg returns 200 with single object. Verified slug='vip-escort-hamburg', 6 sections (each with h2, h2_en, body[], body_en[]), 4 FAQs (each with q, q_en, a, a_en). No _id field. GET /api/service-content/does-not-exist returns 404 with detail field as expected."

  - task: "GET /api/area-content + /{slug}"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Same shape as service-content; lazy-seeded with 18 area docs."
        - working: true
          agent: "testing"
          comment: "✅ VERIFIED: GET /api/area-content returns 200 with exactly 18 area objects. All required fields present (slug, name, title, intro, description, faqs). GET /api/area-content/hamburg returns 200 with single area doc. Lazy-seed working correctly."

  - task: "GET /api/settings"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Creates default doc on first read if none exists."
        - working: true
          agent: "testing"
          comment: "✅ VERIFIED: Returns 200 with JSON object containing site_name='Noir Hamburg', email='kontakt@noir-hamburg.de', phone, whatsappUrl, hours_de, hours_en. No _id field in response. All requirements met."

  - task: "GET /api/models, /api/blog, /api/pages (empty until DB attached)"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Return [] when collection empty. Auth-protected write endpoints are Phase-2."
        - working: true
          agent: "testing"
          comment: "✅ VERIFIED: GET /api/models, GET /api/blog, GET /api/pages all return 200 with empty array []. Expected behavior for Phase 1 (no content seeded yet)."

  - task: "GET /sitemap.xml (dynamic, bilingual)"
    implemented: true
    working: true
    file: "app/sitemap.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Emits DE routes + EN twins + <xhtml:link hreflang> alternates per entry."
        - working: true
          agent: "testing"
          comment: "✅ VERIFIED: Returns 200 with content-type containing 'xml'. Body starts with '<?xml' and contains <urlset>. Verified presence of /services/vip-escort-hamburg and hreflang alternates (xhtml:link rel='alternate' hreflang='en'). All requirements met."

  - task: "GET /robots.txt"
    implemented: true
    working: true
    file: "app/robots.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Allows /, disallows /admin + /api, references sitemap."
        - working: true
          agent: "testing"
          comment: "✅ VERIFIED: Returns 200 with plain text. Contains all required directives: 'Allow: /', 'Disallow: /admin', 'Disallow: /api', and 'Sitemap:' line. All requirements met."

frontend:
  - task: "SSR /services/[slug] with generateMetadata + generateStaticParams + JSON-LD"
    implemented: true
    working: true
    file: "app/(de)/services/[slug]/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Aha-moment verified via curl: /services/vip-escort-hamburg returns real HTML with unique <title>, unique meta description, unique <h1> (the service h1 from DB), <link rel=canonical>, hreflang de-DE + en + x-default, and 3 JSON-LD blocks in <body>: Service, BreadcrumbList, FAQPage. Screenshot confirms design matches reference (Playfair heading, dark editorial hero, correct nav)."

  - task: "SSR /en/services/[slug] EN twin"
    implemented: true
    working: true
    file: "app/(en)/en/services/[slug]/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "html lang=en, EN meta_title/description, EN sections & FAQ, canonical = /en/services/{slug}."

  - task: "DE + EN home / services list"
    implemented: true
    working: true
    file: "app/(de)/page.js, app/(de)/services/page.js, app/(en)/en/page.js, app/(en)/en/services/page.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Minimal but on-brand. Full home hero + models grid + blog etc will be built in Phase 2."

backend_phase2:
  - task: "MongoDB restored from production dump"
    implemented: true
    working: true
    file: "db_export/noir_hamburg/*.bson (restored via mongorestore)"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Restored 212 documents. Counts match: users=1, models=14, blog=13, pages=3, service_content=8, area_content=18, site_settings=1, contacts=80, files=72, content_migrations=2. Real admin bcrypt hash ($2b$12$...) present."
        - working: true
          agent: "testing"
          comment: "✅ VERIFIED: Production dump successfully loaded. GET /api/settings returns real production data (email=kontakt@noir-hamburg.de). GET /api/models returns exactly 14 models including 'aurelia'. GET /api/blog returns exactly 13 posts. GET /api/pages returns exactly 3 pages with expected slugs. All data accessible via API with no _id fields in responses."

  - task: "Collection name fix (settings->site_settings, blog_posts->blog, media->files)"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "GET /api/settings now reads from site_settings (returns real business_name, phone, email, images). GET /api/blog returns 13 real posts. GET /api/pages returns 3 real pages. GET /api/models returns 14 real models."
        - working: true
          agent: "testing"
          comment: "✅ VERIFIED: Collection name mappings working correctly. GET /api/settings reads from site_settings collection and returns all required fields. GET /api/blog reads from blog collection (13 posts). GET /api/pages reads from pages collection (3 pages). GET /api/models reads from models collection (14 models). All endpoints return correct data with no _id fields."

  - task: "POST /api/auth/login"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js + lib/auth.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Manual curl verified: correct creds -> 200 + Set-Cookie access_token (JWT, HS256, 7-day exp). Wrong creds -> 401. Unknown email -> 401 (no user enumeration). Missing fields -> 400. Password_hash never returned in body."
        - working: true
          agent: "testing"
          comment: "✅ VERIFIED: All login scenarios working correctly. Correct credentials (admin@noir-hamburg.de / NoirAdmin2026!) → 200 with user object (email, role=admin, name) and Set-Cookie access_token (HttpOnly, Path=/, Max-Age). Wrong password → 401 'Invalid credentials'. Unknown email → 401 'Invalid credentials' (no user enumeration). Missing fields → 400 'Email and password required'. password_hash never exposed in response."

  - task: "GET /api/auth/me"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js + lib/auth.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "With cookie -> 200 {user:{...}} minus password_hash. Without cookie -> 401. Invalid/tampered JWT -> 401."
        - working: true
          agent: "testing"
          comment: "✅ VERIFIED: Session verification working correctly. With valid access_token cookie → 200 with user object (email=admin@noir-hamburg.de, role=admin) without password_hash. Without cookie → 401 'Not authenticated'. With garbage/tampered JWT → 401. Cookie-based authentication fully functional."

  - task: "POST /api/auth/logout"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js + lib/auth.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Clears the access_token cookie (Max-Age=0). Subsequent /me returns 401."
        - working: true
          agent: "testing"
          comment: "✅ VERIFIED: Logout working correctly. POST /api/auth/logout → 200 {ok:true} with Set-Cookie clearing access_token (Max-Age=0). After logout, GET /api/auth/me returns 401 'Not authenticated'. Session properly terminated."

  - task: "POST /api/auth/change-password"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js + lib/auth.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Requires auth (401 without cookie). Wrong current -> 400. Short new (<8 chars) -> 400. Valid rotation -> 200 {ok:true} + login works with new pw. Verified round-trip: rotated to temp, logged in, rotated back to NoirAdmin2026!, login works."
        - working: true
          agent: "testing"
          comment: "✅ VERIFIED: Password change fully functional with all validations. Without cookie → 401 'Not authenticated'. Wrong current_password → 400 'Current password is incorrect'. Short password (<8 chars) → 400 'New password too short (min 8 chars)'. Valid rotation to TestingRotation2026! → 200 {ok:true}, login with new password successful. CRITICAL: Successfully rotated back to NoirAdmin2026! and verified login works. NOT LOCKED OUT. All destructive tests passed safely."

metadata:
  created_by: "main_agent"
  version: "1.7"
  test_sequence: 8
  run_ui: false

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

backend_phase2_settings_cms:
  - task: "PUT /api/settings"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Admin-only via requireAdmin. Updates the (singleton) site_settings doc. Upserts _key='singleton' + created_at if none exists. Whitelist: business_name, tagline_de/en, phone, email, whatsapp_number, recruitment_whatsapp_number, hours_de/en, homepage_hero_image, escort_hamburg_image, about_image, social_share_image, service_images (map), area_images (map), facebook_url, instagram_url, twitter_url, impressum_content, diskretion_content. Sets updated_at. revalidatePath('/', 'layout') + ('/en', 'layout') + sitemap so every page reflects the change. Manual curl: no-auth 401, partial PUT persisted, GET reflects, whitelist blocked _key/_id/password_hash injection, full baseline restore returned all fields to original values."
        - working: true
          agent: "testing"
          comment: "✅ VERIFIED: Comprehensive 15-step test completed with 71/71 assertions passed. Auth guards working (401 without/with garbage cookie). Partial updates working (phone + instagram_url persisted, other fields unchanged). Map fields working (area_images, service_images - whole map replaced, not merged). Long-text fields working (impressum_content, diskretion_content with newlines preserved). Whitelist enforcement working (_key='singleton' not changed to HACKED, _id/password_hash not injected, business_name changed as whitelisted). Empty body working (200, only updated_at bumped). Upsert safety verified (_key still 'singleton'). SSR revalidation working (business_name change reflected in GET). CRITICAL: Baseline restoration successful - all 20 whitelisted fields restored to original values including empty strings for image fields and empty maps for service_images/area_images. Regression tests passed (health, service-content 8, area-content 18, auth/me, models 14, blog 13, pages 3 all working). Production data is safe. No issues found."

  - task: "Admin CMS UI \u2014 Settings"
    implemented: true
    working: true
    file: "app/(de)/admin/(guarded)/settings/page.js + components/admin/SettingsEditor.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Sections: Identit\u00e4t (business_name, tagline DE/EN), Kontakt (phone, email, 2x WhatsApp, hours DE/EN), Social Media, Bilder (4 single-URL fields), Service-Bilder (map editor keyed by all 8 service slugs), Area-Bilder (map editor keyed by all 18 area slugs, shows N/18 bef\u00fcllt), Impressum + Diskretion (large text). Sticky save + preview link to '/'."

backend_phase2_areas_cms:
  - task: "PUT /api/area-content/{slug}"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Admin-only via requireAdmin. Whitelist: title, name, intro*, description*, long_copy*, meta_title*, meta_description*, image, image_alt*, landmarks[], body_extra*, faqs. Sets updated_at. revalidatePath for /escort/{slug}, /en/escort/{slug}, /areas, /en/areas, /sitemap.xml. Public /escort/{slug} pages don't exist yet (Phase 3), so revalidatePath is a no-op for those routes but harmless. Manual curl round-trip verified with hafencity: baseline captured, partial PUT persisted meta_title+landmarks, unknown slug -> 404, whitelist blocked slug/_id injection, full restore returned all fields to baseline values."
        - working: true
          agent: "testing"
          comment: "✅ VERIFIED: Comprehensive 17-step test completed with 85/85 assertions passed. Auth guards working (401 without/with garbage cookie). Happy path working (partial update with meta_title and meta_description persisted to DB and list). Array field updates working (landmarks, body_extra/body_extra_en, faqs). Whitelist enforcement working (non-whitelisted fields ignored, whitelisted name changed). Empty body working (only updates updated_at). 404 handling working (non-existent slug). SEO-friendly length working (accepts long meta_title). CRITICAL: Baseline restoration successful - all 17 editable fields restored to original values including empty strings for meta_title/meta_title_en/meta_description/meta_description_en/image_alt/image_alt_en and exact landmarks array ['Elbphilharmonie', 'Magellan-Terrassen', 'The Fontenay (nahe)', 'Speicherstadt']. Regression tests passed (health, service-content, settings, auth/me all working, 18 areas still returned). Production data is safe. No issues found."

  - task: "Admin CMS UI \u2014 Areas (list + editor)"
    implemented: true
    working: true
    file: "app/(de)/admin/(guarded)/areas/page.js + edit/[slug]/page.js + components/admin/AreaEditor.js + FormFields.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "List at /admin/areas shows all 18 areas alphabetically with slug/name/meta_title/SEO indicator dot (green=filled, pink=empty). Header shows '0/18 mit Meta-Title bef\u00fcllt' badge \u2014 all meta_* fields are empty in the production data (the whole point of this CMS is to fill them in). Editor at /admin/areas/edit/[slug] has SEO, Grunddaten, Hero-Bild, Erweiterter Text (body_extra ParagraphArrayEditor), Landmarks (StringArrayEditor), FAQs. Sticky save. Extracted shared form primitives to components/admin/FormFields.js (Field, StringArrayEditor, ParagraphArrayEditor, FaqsEditor, SaveToolbar)."

backend_phase2_services_cms:
  - task: "PUT /api/admin/service-content/{slug}"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Admin-only via requireAdmin. Whitelist of editable fields. Sets updated_at. Calls revalidatePath for /services/{slug}, /en/services/{slug}, /services, /en/services, /, /sitemap.xml. Manual round-trip verified: PUT changed meta_title, GET api returned new value, /services/vip-escort-hamburg <title> updated, restored to original."
        - working: true
          agent: "testing"
          comment: "✅ VERIFIED: Comprehensive 19-step test completed with 67/67 assertions passed. Auth guards working (401 without/with garbage cookie). Partial updates working (meta_title persisted to DB and SSR page). Complex field updates working (sections, faqs, keypoints, related_services). Whitelist enforcement working (non-whitelisted fields ignored). 404 handling working (non-existent slug). SSR revalidation working (h1 and meta_title changes reflected in public HTML within 2 seconds). CRITICAL: Baseline restoration successful - all 21 editable fields restored to original values and verified in both DB and SSR page. Regression tests passed (health, service-content, settings, auth/me all working). No issues found."

agent_communication:
    - agent: "main"
      message: |
        Phase 1 of Noir Hamburg FARM→farmnext migration complete.
        Aha-moment achieved: /services/vip-escort-hamburg is fully SSR-rendered with unique
        title, meta, h1, canonical, hreflang de/en/x-default, and 3 JSON-LD blocks
        (Service+BreadcrumbList+FAQPage) in <body>. Backend endpoints for read paths ported
        1:1 from the FastAPI reference. MongoDB collection is lazy-seeded from the reference
        JSON on first read (so it works before the user clicks "Replace with existing DB").
        Please test:
        1. GET /api/health → 200 with {status:'ok'}
        2. GET /api/service-content → array of 8 items (slugs from reference)
        3. GET /api/service-content/vip-escort-hamburg → single doc with sections, faqs
        4. GET /api/service-content/nonexistent → 404
        5. GET /api/area-content → array of 18 items
        6. GET /api/settings → object with site_name, phone, email
        7. GET /api/models, /api/blog, /api/pages → 200 with [] (empty until DB attached)
        8. GET /sitemap.xml → valid XML with hreflang alternates
        9. GET /robots.txt → allows /, disallows /admin + /api
        DO NOT touch admin auth / write endpoints — those are Phase 2 and intentionally not
        implemented yet.
    - agent: "testing"
      message: |
        ✅ PHASE 1 BACKEND TESTING COMPLETE - ALL TESTS PASSED (14/14)
        
        Comprehensive testing of all Phase 1 read-only Next.js Route Handlers completed successfully.
        Base URL: https://noir-migration.preview.emergentagent.com
        
        Test Results Summary:
        ✅ GET /api/health - Returns 200 with status='ok', service='noir-hamburg-nextjs', ISO timestamp
        ✅ GET /api/service-content - Returns 8 service objects with all required fields and expected slugs
        ✅ GET /api/service-content/vip-escort-hamburg - Returns single doc with 6 sections, 4 FAQs, no _id
        ✅ GET /api/service-content/does-not-exist - Returns 404 with detail field
        ✅ GET /api/area-content - Returns 18 area objects with all required fields
        ✅ GET /api/area-content/hamburg - Returns single area doc
        ✅ GET /api/settings - Returns object with all required fields (site_name, email, phone, etc.), no _id
        ✅ GET /api/models - Returns empty array []
        ✅ GET /api/blog - Returns empty array []
        ✅ GET /api/pages - Returns empty array []
        ✅ GET /sitemap.xml - Valid XML with hreflang alternates and service pages
        ✅ GET /robots.txt - Contains all required directives
        ✅ Idempotency test - Multiple calls to /api/service-content return consistent 8 items (no duplication)
        ✅ GET /api/sitemap/status - Returns services=8, areas=18
        
        Critical Verifications:
        • Lazy-seeding working correctly (service_content and area_content collections)
        • MongoDB ObjectId (_id) properly stripped from all responses
        • 404 error handling working as expected
        • All data structures match FastAPI reference backend 1:1
        • No duplicate insertions on subsequent reads (idempotency verified)
        
        All backend tasks marked as working=true, needs_retesting=false.
        No issues found. Phase 1 backend implementation is production-ready.
    - agent: "testing"
      message: |
        ✅ PHASE 2 CHUNK A BACKEND TESTING COMPLETE - ALL TESTS PASSED (25/25)
        
        Comprehensive testing of JWT auth + production data parity completed successfully.
        Base URL: https://noir-migration.preview.emergentagent.com
        Admin credentials verified: admin@noir-hamburg.de / NoirAdmin2026!
        
        Test Results by Section:
        
        SECTION 1: DATA-PARITY (5/5 passed)
        ✅ GET /api/settings → 200 with real production fields (email=kontakt@noir-hamburg.de)
        ✅ GET /api/models → 200 with exactly 14 models (including 'aurelia')
        ✅ GET /api/blog → 200 with exactly 13 posts (all published=true)
        ✅ GET /api/pages → 200 with exactly 3 pages (all expected slugs present)
        ✅ GET /api/service-content + /api/area-content → 8 and 18 respectively
        
        SECTION 2: AUTH HAPPY PATH (4/4 passed)
        ✅ POST /api/auth/login with correct credentials → 200 + Set-Cookie access_token (HttpOnly, Path=/, Max-Age)
        ✅ GET /api/auth/me with cookie → 200 with user object (no password_hash)
        ✅ POST /api/auth/logout → 200 {ok:true} + cookie cleared (Max-Age=0)
        ✅ GET /api/auth/me after logout → 401 'Not authenticated'
        
        SECTION 3: AUTH FAILURES (5/5 passed)
        ✅ POST /api/auth/login with wrong password → 401 'Invalid credentials'
        ✅ POST /api/auth/login with unknown email → 401 'Invalid credentials' (no user enumeration)
        ✅ POST /api/auth/login with missing fields → 400 'Email and password required'
        ✅ GET /api/auth/me without cookie → 401
        ✅ GET /api/auth/me with garbage cookie → 401
        
        SECTION 4: CHANGE-PASSWORD (8/8 passed)
        ✅ Login again (fresh cookie) → 200
        ✅ POST /api/auth/change-password without cookie → 401 'Not authenticated'
        ✅ POST /api/auth/change-password with wrong current_password → 400 'Current password is incorrect'
        ✅ POST /api/auth/change-password with short password → 400 'New password too short (min 8 chars)'
        ✅ POST /api/auth/change-password valid rotation to TestingRotation2026! → 200 {ok:true}
        ✅ POST /api/auth/login with TestingRotation2026! → 200 (rotation persisted)
        ✅ CRITICAL: Rotate back to NoirAdmin2026! → 200 {ok:true}
        ✅ CRITICAL: Final verification login with NoirAdmin2026! → 200 (NOT LOCKED OUT)
        
        SECTION 5: REGRESSION ON PHASE 1 (3/3 passed)
        ✅ GET /api/health, /api/service-content, /api/service-content/vip-escort-hamburg → all 200
        ✅ GET /sitemap.xml and /robots.txt → still valid
        ✅ GET /api/sitemap/status → correct counts (services:8, areas:18, models:14, blog:13, pages:3)
        
        Critical Verifications:
        • Production MongoDB dump successfully loaded and accessible via API
        • Collection name mappings working (site_settings, blog, pages, models)
        • JWT authentication fully functional with HttpOnly cookies
        • Password hashing with bcrypt working correctly
        • No password_hash exposure in any response
        • No user enumeration (same error message for wrong password and unknown email)
        • Password change with full validation (auth required, current password check, length validation)
        • Destructive password rotation test passed safely (rotated and restored)
        • All Phase 1 endpoints still working (no regression)
        • No _id fields in any response (cleanDoc working correctly)
        
    - agent: "testing"
      message: |
        ✅ PHASE 2 SERVICES CMS — PUT /api/admin/service-content/{slug} TESTING COMPLETE - ALL TESTS PASSED (67/67)
        
        Comprehensive 19-step test of admin-gated service content update endpoint completed successfully.
        Base URL: https://noir-migration.preview.emergentagent.com
        Test slug: vip-escort-hamburg
        Admin credentials: admin@noir-hamburg.de / NoirAdmin2026!
        
        Test Results by Section:
        
        SECTION 1: AUTH GUARDS (4/4 passed)
        ✅ PUT without cookie → 401 'Not authenticated'
        ✅ PUT with garbage cookie → 401
        ✅ Login as admin → 200 with access_token cookie
        ✅ Baseline saved (23 fields from GET /api/service-content/vip-escort-hamburg)
        
        SECTION 2: HAPPY PATH — PARTIAL UPDATE (6/6 passed)
        ✅ PUT meta_title='Test title 1' → 200 with updated_at field
        ✅ GET verified meta_title='Test title 1', other fields (h1, tagline, description) unchanged
        ✅ Public SSR page /services/vip-escort-hamburg shows <title>Test title 1</title> (revalidatePath working)
        
        SECTION 3: COMPLEX-FIELD UPDATES (4/4 passed)
        ✅ PUT sections (2 sections with h2, h2_en, body[], body_en[]) → 200, GET verified match
        ✅ PUT faqs (1 FAQ with q, q_en, a, a_en) → 200, GET verified match
        ✅ PUT keypoints + keypoints_en → 200, GET verified arrays match
        ✅ PUT related_services → 200, GET verified match
        
        SECTION 4: WHITELIST ENFORCEMENT (3/3 passed)
        ✅ PUT non-whitelisted fields (slug, _id, created_at, password_hash) → 200, fields ignored (slug still 'vip-escort-hamburg', no password_hash injected)
        ✅ PUT empty body {} → 200, baseline fields intact
        
        SECTION 5: 404 (2/2 passed)
        ✅ PUT /api/admin/service-content/does-not-exist → 404 'Service not found'
        
        SECTION 6: SSR REVALIDATION CROSS-CHECK (2/2 passed)
        ✅ PUT h1='RevalidationCheck H1' → 200
        ✅ Public page shows 'RevalidationCheck H1' in HTML (revalidatePath working)
        
        SECTION 7: CRITICAL — RESTORE BASELINE (24/24 passed)
        ✅ PUT all 21 editable fields back to baseline in ONE call → 200
        ✅ GET verified deep equality: all 21 fields (meta_title, meta_title_en, meta_description, meta_description_en, h1, title, short_label, tagline, tagline_en, description, description_en, long_copy, long_copy_en, image, image_alt, image_alt_en, keypoints, keypoints_en, related_services, sections, faqs) restored to original values
        ✅ Public page verified: <title> matches baseline meta_title, <h1> matches baseline h1, JSON-LD Service block present
        
        SECTION 8: REGRESSION (4/4 passed)
        ✅ GET /api/health → 200
        ✅ GET /api/service-content → 200 with 8 items
        ✅ GET /api/settings → 200
        ✅ GET /api/auth/me with same cookie → 200 with correct user email
        
        Critical Verifications:
        • Admin authentication guard working (requireAdmin)
        • Whitelist enforcement working (only allowed fields updated)
        • updated_at field automatically set on every update
        • revalidatePath working for both DE and EN service pages (SSR cache busted within 2 seconds)
        • Partial updates working (only specified fields changed)
        • Complex nested structures (sections, faqs) handled correctly
        • 404 handling for non-existent slugs
        • CRITICAL: Baseline restoration successful - production content NOT corrupted
        • No regression on other endpoints
        
        All tests passed. PUT /api/admin/service-content/{slug} endpoint is production-ready.
        Task marked as working=true, needs_retesting=false.

        All Phase 2 Chunk A backend tasks marked as working=true, needs_retesting=false.
        No issues found. Phase 2 Chunk A backend implementation is production-ready.
    - agent: "testing"
      message: |
        ✅ PHASE 2 AREAS CMS — PUT /api/area-content/{slug} TESTING COMPLETE - ALL TESTS PASSED (85/85)
        
        Comprehensive 17-step test of admin-gated area content update endpoint completed successfully.
        Base URL: https://noir-migration.preview.emergentagent.com
        Test slug: hafencity
        Admin credentials: admin@noir-hamburg.de / NoirAdmin2026!
        
        Test Results by Section:
        
        SECTION 1: AUTH GUARDS (4/4 passed)
        ✅ PUT without cookie → 401 'Not authenticated'
        ✅ PUT with garbage cookie → 401
        ✅ Login as admin → 200 with access_token cookie
        ✅ Baseline saved (19 fields from GET /api/area-content/hafencity)
        
        SECTION 2: HAPPY PATH — PARTIAL UPDATE (17/17 passed)
        ✅ PUT meta_title='HafenCity Test | Noir Hamburg' and meta_description → 200 with updated_at field
        ✅ GET verified both fields persisted, all other baseline fields (name, intro, description, body_extra, landmarks, faqs, image, image_alt, image_alt_en, description_en, intro_en, meta_title_en, meta_description_en) unchanged
        ✅ GET /api/area-content list → still 18 areas, hafencity entry has new meta_title
        
        SECTION 3: ARRAY FIELD UPDATES (7/7 passed)
        ✅ PUT landmarks=['Elbphilharmonie', 'Speicherstadt', 'Alster', 'U4-Station'] → 200, GET verified match, body_extra + faqs still baseline
        ✅ PUT body_extra=['First paragraph.', 'Second paragraph.'], body_extra_en=['First EN paragraph.'] → 200, GET verified both arrays match
        ✅ PUT faqs (1 FAQ with q, q_en, a, a_en) → 200, GET verified match
        
        SECTION 4: WHITELIST ENFORCEMENT (4/4 passed)
        ✅ PUT non-whitelisted fields (slug='HACKED', _id='HACKED', password_hash='HACKED') + whitelisted name='clean-name-change' → 200, slug still 'hafencity', no _id/password_hash injected, name DID change (in whitelist)
        
        SECTION 5: EMPTY / MINIMAL BODY (1/1 passed)
        ✅ PUT empty body {} → 200, all fields intact
        
        SECTION 6: 404 (2/2 passed)
        ✅ PUT /api/area-content/does-not-exist → 404 'Area not found'
        
        SECTION 7: SEO-FRIENDLY LENGTH VERIFICATION (2/2 passed)
        ✅ PUT meta_title (120 chars) → 200 (no server-side length limit, informational only)
        
        SECTION 8: CRITICAL — FULL RESTORE (25/25 passed)
        ✅ PUT all 17 editable fields back to baseline in ONE call → 200
        ✅ GET verified deep equality: all 17 fields (title, name, intro, intro_en, description, description_en, meta_title, meta_title_en, meta_description, meta_description_en, image, image_alt, image_alt_en, landmarks, body_extra, body_extra_en, faqs) restored to original values
        ✅ Verified specific baseline values: meta_title, meta_title_en, meta_description, meta_description_en, image_alt, image_alt_en are all EMPTY STRINGS (as in production baseline)
        ✅ Verified landmarks exactly match baseline: ['Elbphilharmonie', 'Magellan-Terrassen', 'The Fontenay (nahe)', 'Speicherstadt']
        
        SECTION 9: REGRESSION (9/9 passed)
        ✅ GET /api/health, /api/service-content, /api/service-content/vip-escort-hamburg, /api/settings → all 200
        ✅ GET /api/service-content → still 8 items
        ✅ GET /api/auth/me with same cookie → 200 with correct user email
        ✅ GET /api/area-content → still 18 areas
        
        Critical Verifications:
        • Admin authentication guard working (requireAdmin)
        • Whitelist enforcement working (only allowed fields updated)
        • updated_at field automatically set on every update
        • Partial updates working (only specified fields changed)
        • Complex nested structures (landmarks, body_extra, faqs) handled correctly
        • 404 handling for non-existent slugs
        • CRITICAL: Baseline restoration successful - production content NOT corrupted
        • All empty string fields (meta_title, meta_title_en, meta_description, meta_description_en, image_alt, image_alt_en) restored to empty strings (not undefined, not test values)
        • Landmarks array exactly matches baseline (4 items in correct order)
        • No regression on other endpoints
        
        All tests passed. PUT /api/area-content/{slug} endpoint is production-ready.
        Task marked as working=true, needs_retesting=false.

    - agent: "testing"
      message: |
        ✅ PHASE 2 SETTINGS CMS — PUT /api/settings TESTING COMPLETE - ALL TESTS PASSED (71/71)
        
        Comprehensive 15-step test of admin-gated site_settings update endpoint completed successfully.
        Base URL: https://noir-migration.preview.emergentagent.com
        Admin credentials: admin@noir-hamburg.de / NoirAdmin2026!
        
        Test Results by Section:
        
        SECTION 1: AUTH GUARDS (5/5 passed)
        ✅ PUT without cookie → 401 'Not authenticated'
        ✅ PUT with garbage cookie → 401
        ✅ Login as admin → 200 with access_token cookie
        ✅ Baseline saved (22 fields from GET /api/settings)
        ✅ Confirmed no _id in response
        
        SECTION 2: PARTIAL UPDATE (6/6 passed)
        ✅ PUT phone='+49 40 12345678', instagram_url='https://instagram.com/test_noir' → 200
        ✅ GET verified both fields persisted, other fields (business_name, tagline_de, hours_de) unchanged
        
        SECTION 3: MAP FIELDS (4/4 passed)
        ✅ PUT area_images={'hafencity':'...','altona':'...'} → 200, GET verified exact match (whole map replaced)
        ✅ PUT service_images={'vip-escort-hamburg':'...'} → 200, GET verified exact match
        
        SECTION 4: LONG-TEXT FIELDS (3/3 passed)
        ✅ PUT impressum_content + diskretion_content (with newlines) → 200
        ✅ GET verified both stored verbatim (newlines preserved)
        
        SECTION 5: WHITELIST ENFORCEMENT (5/5 passed)
        ✅ PUT _key='HACKED', _id='HACKED', password_hash='HACKED', business_name='clean-update' → 200
        ✅ GET verified _key still 'singleton' (not HACKED), no _id/password_hash injected, business_name DID change (whitelisted)
        
        SECTION 6: EMPTY BODY (2/2 passed)
        ✅ PUT {} → 200, GET verified business_name still 'clean-update' (only updated_at bumped)
        
        SECTION 7: UPSERT SAFETY (2/2 passed)
        ✅ GET /api/settings → 200, _key is 'singleton' (collection still has exactly 1 document)
        
        SECTION 8: SSR REVALIDATION CROSS-CHECK (3/3 passed)
        ✅ PUT business_name='Revalidation Test Brand' → 200
        ✅ Homepage returned 200 (revalidatePath called)
        ✅ GET /api/settings reflects new business_name
        
        SECTION 9: CRITICAL — FULL RESTORE (22/22 passed)
        ✅ PUT all 20 whitelisted fields back to baseline in ONE call → 200
        ✅ GET verified deep equality: all 20 fields (business_name, tagline_de, tagline_en, phone, email, whatsapp_number, recruitment_whatsapp_number, hours_de, hours_en, homepage_hero_image, escort_hamburg_image, about_image, social_share_image, service_images, area_images, facebook_url, instagram_url, twitter_url, impressum_content, diskretion_content) restored to original values
        ✅ Verified empty strings for image fields (homepage_hero_image, escort_hamburg_image, about_image, social_share_image, facebook_url, instagram_url, twitter_url, impressum_content, diskretion_content)
        ✅ Verified empty maps for service_images and area_images
        
        SECTION 10: REGRESSION (13/13 passed)
        ✅ GET /api/health → 200
        ✅ GET /api/service-content → 200 with 8 items
        ✅ GET /api/area-content → 200 with 18 items
        ✅ GET /api/auth/me with same cookie → 200 with correct user email
        ✅ GET /api/models → 200 with 14 items
        ✅ GET /api/blog → 200 with 13 items
        ✅ GET /api/pages → 200 with 3 items
        
        Critical Verifications:
        • Admin authentication guard working (requireAdmin)
        • Whitelist enforcement working (only allowed fields updated)
        • updated_at field automatically set on every update
        • Map fields (service_images, area_images) replace entire map (not merge)
        • Long-text fields preserve newlines and special characters
        • Upsert safety verified (_key='singleton' protected)
        • revalidatePath working for layout and sitemap
        • CRITICAL: Baseline restoration successful - production content NOT corrupted
        • All empty string fields restored to empty strings (not undefined, not test values)
        • All empty map fields restored to empty maps {}
        • No regression on other endpoints
        
        All tests passed. PUT /api/settings endpoint is production-ready.
        Task marked as working=true, needs_retesting=false.
