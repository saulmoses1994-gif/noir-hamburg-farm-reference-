#!/bin/bash

# Final technical SEO sprint verification
# Target: http://localhost:3000

BASE_URL="http://localhost:3000"
PASS_COUNT=0
FAIL_COUNT=0

echo "================================================================================"
echo "FINAL TECHNICAL SEO SPRINT VERIFICATION"
echo "Target: $BASE_URL"
echo "================================================================================"

# Helper function to test
test_pass() {
    echo "✅ PASS: $1"
    ((PASS_COUNT++))
}

test_fail() {
    echo "❌ FAIL: $1"
    ((FAIL_COUNT++))
}

echo ""
echo "################################################################################"
echo "# SECTION A — CWV ASSETS PRESENT (NEW BEHAVIOR)"
echo "################################################################################"

# TEST A1: Preconnect + dns-prefetch
echo ""
echo "TEST A1: CWV preconnect + dns-prefetch tags on homepage"
HTML=$(curl -s "$BASE_URL/")
if echo "$HTML" | grep -q 'rel="preconnect".*fonts.googleapis.com' && \
   echo "$HTML" | grep -q 'rel="preconnect".*fonts.gstatic.com.*crossorigin' && \
   echo "$HTML" | grep -q 'rel="preconnect".*res.cloudinary.com.*crossorigin' && \
   echo "$HTML" | grep -q 'rel="dns-prefetch".*fonts.googleapis.com' && \
   echo "$HTML" | grep -q 'rel="dns-prefetch".*res.cloudinary.com'; then
    test_pass "A1 - All preconnect and dns-prefetch tags present"
else
    test_fail "A1 - Missing required preconnect or dns-prefetch tags"
fi

# TEST A2: Hero preload DE
echo ""
echo "TEST A2: Hero image preload on DE homepage"
if echo "$HTML" | grep -q 'rel="preload".*as="image".*fetchPriority="high"' && \
   (echo "$HTML" | grep -q 'cloudinary\|unsplash') && \
   (echo "$HTML" | grep -q 'f_auto\|q_auto\|w='); then
    test_pass "A2 - Hero image preload with fetchPriority=high and optimization params"
else
    test_fail "A2 - Hero image preload missing or incorrect"
fi

# TEST A3: Hero preload EN
echo ""
echo "TEST A3: Hero image preload on EN homepage"
HTML_EN=$(curl -s "$BASE_URL/en")
if echo "$HTML_EN" | grep -q 'rel="preload".*as="image".*fetchPriority="high"' && \
   (echo "$HTML_EN" | grep -q 'cloudinary\|unsplash') && \
   (echo "$HTML_EN" | grep -q 'f_auto\|q_auto\|w='); then
    test_pass "A3 - EN hero image preload with fetchPriority=high and optimization params"
else
    test_fail "A3 - EN hero image preload missing or incorrect"
fi

# TEST A4: Service page preconnect
echo ""
echo "TEST A4: Service page has preconnect (global layout)"
HTML_SERVICE=$(curl -s "$BASE_URL/services/vip-escort-hamburg")
PRECONNECT_COUNT=$(echo "$HTML_SERVICE" | grep -c 'rel="preconnect"')
if [ "$PRECONNECT_COUNT" -ge 3 ]; then
    test_pass "A4 - Service page has $PRECONNECT_COUNT preconnect tags (root layout applies globally)"
else
    test_fail "A4 - Service page has only $PRECONNECT_COUNT preconnect tags (expected >= 3)"
fi

echo ""
echo "################################################################################"
echo "# SECTION B — REGRESSION CHECKS (EXISTING BEHAVIOR PRESERVED)"
echo "################################################################################"

# TEST B1: DE lang
echo ""
echo "TEST B1: DE homepage has html lang='de'"
if echo "$HTML" | grep -q '<html lang="de"'; then
    test_pass "B1 - Found <html lang='de'>"
else
    test_fail "B1 - <html lang='de'> not found"
fi

# TEST B2: EN lang
echo ""
echo "TEST B2: EN homepage has html lang='en'"
if echo "$HTML_EN" | grep -q '<html lang="en"'; then
    test_pass "B2 - Found <html lang='en'>"
else
    test_fail "B2 - <html lang='en'> not found"
fi

# TEST B3: Canonical
echo ""
echo "TEST B3: DE homepage has correct canonical"
if echo "$HTML" | grep -q 'rel="canonical".*href="https://noir-hamburg.com'; then
    test_pass "B3 - Canonical URL correct"
else
    test_fail "B3 - Canonical URL incorrect or missing"
fi

# TEST B4: Hreflang
echo ""
echo "TEST B4: DE homepage has hreflang alternates"
HREFLANG_COUNT=$(echo "$HTML" | grep -c 'rel="alternate".*hreflang=')
if [ "$HREFLANG_COUNT" -ge 3 ]; then
    test_pass "B4 - Found $HREFLANG_COUNT hreflang alternates"
else
    test_fail "B4 - Found only $HREFLANG_COUNT hreflang alternates (expected >= 3)"
fi

# TEST B5: Sitemap status
echo ""
echo "TEST B5: Sitemap returns 200 with multiple <loc> entries"
SITEMAP=$(curl -s "$BASE_URL/sitemap.xml")
LOC_COUNT=$(echo "$SITEMAP" | grep -c '<loc>')
if [ "$LOC_COUNT" -gt 1 ]; then
    test_pass "B5 - Sitemap has $LOC_COUNT <loc> entries"
else
    test_fail "B5 - Sitemap has only $LOC_COUNT <loc> entries"
fi

# TEST B6: Sitemap hreflang
echo ""
echo "TEST B6: Sitemap uses hreflang='de' (not 'de-DE')"
if echo "$SITEMAP" | grep -q 'hreflang="de"' && ! echo "$SITEMAP" | grep -q 'hreflang="de-DE"'; then
    test_pass "B6 - Sitemap uses hreflang='de' (not 'de-DE')"
else
    test_fail "B6 - Sitemap should use hreflang='de' not 'de-DE'"
fi

# TEST B7: Robots sitemap
echo ""
echo "TEST B7: robots.txt returns 200 with Sitemap directive"
ROBOTS=$(curl -s "$BASE_URL/robots.txt")
if echo "$ROBOTS" | grep -q 'Sitemap:'; then
    test_pass "B7 - robots.txt contains 'Sitemap:' directive"
else
    test_fail "B7 - robots.txt missing 'Sitemap:' directive"
fi

# TEST B8: Robots no host
echo ""
echo "TEST B8: robots.txt does NOT contain Host directive"
if ! echo "$ROBOTS" | grep -q 'Host:'; then
    test_pass "B8 - robots.txt does NOT contain 'Host:' directive"
else
    test_fail "B8 - robots.txt should NOT contain 'Host:' directive"
fi

# TEST B9: llms.txt
echo ""
echo "TEST B9: llms.txt returns 200 with text/plain content-type"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/llms.txt")
CONTENT_TYPE=$(curl -s -I "$BASE_URL/llms.txt" | grep -i "content-type:" | cut -d' ' -f2-)
if [ "$STATUS" = "200" ] && echo "$CONTENT_TYPE" | grep -q "text/plain"; then
    test_pass "B9 - llms.txt has content-type: $CONTENT_TYPE"
else
    test_fail "B9 - llms.txt status=$STATUS, content-type=$CONTENT_TYPE"
fi

# TEST B10: Redirect diskretion
echo ""
echo "TEST B10: /p/diskretion redirects to full slug"
REDIRECT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/p/diskretion")
LOCATION=$(curl -s -I "$BASE_URL/p/diskretion" | grep -i "location:" | cut -d' ' -f2- | tr -d '\r')
if [ "$REDIRECT_STATUS" = "301" ] || [ "$REDIRECT_STATUS" = "302" ] || [ "$REDIRECT_STATUS" = "307" ] || [ "$REDIRECT_STATUS" = "308" ]; then
    if echo "$LOCATION" | grep -q "diskretion-und-datenschutz-noir-hamburg"; then
        test_pass "B10 - Redirects ($REDIRECT_STATUS) to correct full slug"
    else
        test_fail "B10 - Redirect location incorrect: $LOCATION"
    fi
else
    test_fail "B10 - Expected redirect, got $REDIRECT_STATUS"
fi

# TEST B11: Redirect EN diskretion
echo ""
echo "TEST B11: EN diskretion page redirects to DE version"
REDIRECT_STATUS_EN=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/en/p/diskretion-und-datenschutz-noir-hamburg")
LOCATION_EN=$(curl -s -I "$BASE_URL/en/p/diskretion-und-datenschutz-noir-hamburg" | grep -i "location:" | cut -d' ' -f2- | tr -d '\r')
if [ "$REDIRECT_STATUS_EN" = "301" ] || [ "$REDIRECT_STATUS_EN" = "302" ] || [ "$REDIRECT_STATUS_EN" = "307" ] || [ "$REDIRECT_STATUS_EN" = "308" ]; then
    if echo "$LOCATION_EN" | grep -q "/p/diskretion-und-datenschutz-noir-hamburg"; then
        test_pass "B11 - Redirects ($REDIRECT_STATUS_EN) to DE version"
    else
        test_fail "B11 - Redirect location incorrect: $LOCATION_EN"
    fi
else
    test_fail "B11 - Expected redirect, got $REDIRECT_STATUS_EN"
fi

# TEST B12: Blog title
echo ""
echo "TEST B12: Blog post has correct unique title"
BLOG_HTML=$(curl -s "$BASE_URL/blog/diskretion-im-zeitalter-digitaler-spuren-wie-wir-ihre-privatsphaere-wirklich-schuetzen")
TITLE=$(echo "$BLOG_HTML" | grep -o '<title[^>]*>[^<]*</title>' | sed 's/<[^>]*>//g')
if echo "$TITLE" | grep -q "Zeitalter" && [ "$TITLE" != "Diskretion & Datenschutz | Noir Hamburg Premium Escort" ]; then
    test_pass "B12 - Blog post has correct unique title"
else
    test_fail "B12 - Blog post title incorrect: $TITLE"
fi

# TEST B13: Homepage H1
echo ""
echo "TEST B13: Homepage has H1 with 'Noir' and 'Hamburg'"
if echo "$HTML" | grep -o '<h1[^>]*>.*</h1>' | grep -q "Noir" && echo "$HTML" | grep -o '<h1[^>]*>.*</h1>' | grep -q "Hamburg"; then
    test_pass "B13 - H1 contains both 'Noir' and 'Hamburg'"
else
    test_fail "B13 - H1 missing 'Noir' or 'Hamburg'"
fi

# TEST B14: Models page
echo ""
echo "TEST B14: /models page returns 200"
MODELS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/models")
if [ "$MODELS_STATUS" = "200" ]; then
    test_pass "B14 - /models returns 200"
else
    test_fail "B14 - /models returns $MODELS_STATUS"
fi

# Summary
echo ""
echo "================================================================================"
echo "SUMMARY"
echo "================================================================================"
TOTAL=$((PASS_COUNT + FAIL_COUNT))
echo ""
echo "Total: $PASS_COUNT/$TOTAL tests passed"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo "================================================================================"
    echo "✅ ALL TESTS PASSED"
    echo "================================================================================"
    exit 0
else
    echo "================================================================================"
    echo "❌ $FAIL_COUNT TEST(S) FAILED"
    echo "================================================================================"
    exit 1
fi
