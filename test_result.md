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

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 2
  run_ui: false

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

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
