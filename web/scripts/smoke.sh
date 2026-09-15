#!/usr/bin/env bash
# End-to-end smoke test against a running instance (default: http://localhost:3000).
# Exercises the security-relevant behavior called out in the migration plan —
# not a substitute for real tests, but enough to catch a broken deploy.
set -uo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
TMP_DIR=$(mktemp -d)
COOKIES_A="$TMP_DIR/cookies_a.txt"
COOKIES_B="$TMP_DIR/cookies_b.txt"
PASS=0
FAIL=0

cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

check() {
  local desc="$1" got="$2" want="$3"
  if [[ "$got" == "$want" ]]; then
    PASS=$((PASS + 1))
    echo "  ok   $desc"
  else
    FAIL=$((FAIL + 1))
    echo "  FAIL $desc (expected $want, got $got)"
  fi
}

rand() { echo "$RANDOM$RANDOM$$"; }

echo "== Smoke test against $BASE_URL =="

# --- Register + login (user A) -------------------------------------------
EMAIL_A="smoke-$(rand)@example.com"
PASSWORD_A="SmokeTest1234pass"

echo "-- register/login (user A) --"
CODE=$(curl -s -o /dev/null -w '%{http_code}' -c "$COOKIES_A" -X POST "$BASE_URL/api/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"firstName\":\"Smoke\",\"lastName\":\"Test\",\"email\":\"$EMAIL_A\",\"password\":\"$PASSWORD_A\"}")
check "register returns 201" "$CODE" "201"

CODE=$(curl -s -o /dev/null -w '%{http_code}' -c "$COOKIES_A" -b "$COOKIES_A" -X POST "$BASE_URL/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL_A\",\"password\":\"$PASSWORD_A\"}")
check "login returns 200" "$CODE" "200"

grep -qi 'HttpOnly' "$COOKIES_A" && HTTPONLY=yes || HTTPONLY=no
check "session cookie is HttpOnly" "$HTTPONLY" "yes"

CODE=$(curl -s -o /dev/null -w '%{http_code}' -b "$COOKIES_A" "$BASE_URL/api/auth/session")
check "session check returns 200" "$CODE" "200"

# --- Register + login (user B, for ownership tests) -----------------------
EMAIL_B="smoke-$(rand)@example.com"
REG_B_CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE_URL/api/auth/register" -H 'Content-Type: application/json' \
  -d "{\"firstName\":\"Smoke\",\"lastName\":\"Two\",\"email\":\"$EMAIL_B\",\"password\":\"$PASSWORD_A\"}")
if [[ "$REG_B_CODE" == "429" ]]; then
  echo "  note: user B registration was rate-limited (429) — the register bucket is 3/hour/IP and" \
       "this script just registered user A from the same IP. This is the limiter working, not a bug;" \
       "the ownership checks below will report a false failure until the window resets. Re-run later," \
       "from a different IP, or temporarily raise RATE_LIMITS.register in lib/api/rate-limit.ts to test back-to-back."
fi
curl -s -o /dev/null -c "$COOKIES_B" -X POST "$BASE_URL/api/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL_B\",\"password\":\"$PASSWORD_A\"}"

# --- Ad creation and ownership ---------------------------------------------
echo "-- ads --"
AD_JSON=$(curl -s -b "$COOKIES_A" -X POST "$BASE_URL/api/ads" -H 'Content-Type: application/json' \
  -d '{"title":"Smoke Test Ad","description":"A perfectly ordinary test listing.","price":42,"location":"Testville","category":"tools","contactNumber":"+15550001111","currency":"USD","images":[]}')
AD_ID=$(echo "$AD_JSON" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
if [[ -n "${AD_ID:-}" ]]; then
  PASS=$((PASS + 1)); echo "  ok   ad created (id=$AD_ID)"
else
  FAIL=$((FAIL + 1)); echo "  FAIL ad creation did not return an id: $AD_JSON"
fi

CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE_URL/api/ads" -H 'Content-Type: application/json' \
  -d '{"title":"No Auth","description":"x","price":1,"location":"x","category":"tools","contactNumber":"+15550001111"}')
check "create without session returns 401" "$CODE" "401"

if [[ -n "${AD_ID:-}" ]]; then
  RESP=$(curl -s "$BASE_URL/api/ads/$AD_ID")
  # "email"/"phone" as JSON keys are real contact PII and must never appear
  # here (the ad's own "contactNumber" and "location" fields are expected
  # and distinctly named). `bio` is deliberately included — self-authored
  # trust text, not PII (see lib/dto/user.ts) — so it's not checked.
  if echo "$RESP" | grep -qiE '"email":|"phone":'; then
    FAIL=$((FAIL + 1)); echo "  FAIL public ad response leaks publisher PII: $RESP"
  else
    PASS=$((PASS + 1)); echo "  ok   public ad response has no publisher email/phone"
  fi

  CODE=$(curl -s -o /dev/null -w '%{http_code}' -b "$COOKIES_B" -X DELETE "$BASE_URL/api/ads/$AD_ID")
  check "user B deleting user A's ad returns 404 (not 403)" "$CODE" "404"

  CODE=$(curl -s -o /dev/null -w '%{http_code}' -b "$COOKIES_A" -X DELETE "$BASE_URL/api/ads/$AD_ID")
  check "owner deleting their own ad returns 204" "$CODE" "204"
fi

# --- Pagination clamp -------------------------------------------------------
RESP=$(curl -s "$BASE_URL/api/ads?limit=100000")
if echo "$RESP" | grep -q '"code":"validation_error"'; then
  PASS=$((PASS + 1)); echo "  ok   oversized limit is rejected by validation"
else
  FAIL=$((FAIL + 1)); echo "  FAIL oversized limit was not rejected: $RESP"
fi

# --- Rate limiting on login --------------------------------------------------
echo "-- rate limiting --"
LAST_CODE=200
for i in $(seq 1 7); do
  LAST_CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE_URL/api/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$EMAIL_A\",\"password\":\"wrong-password\"}")
done
check "6th+ bad login attempt is rate limited" "$LAST_CODE" "429"

# --- CSRF: cross-origin write rejected --------------------------------------
echo "-- csrf --"
CODE=$(curl -s -o /dev/null -w '%{http_code}' -b "$COOKIES_A" -X POST "$BASE_URL/api/ads" \
  -H 'Content-Type: application/json' -H 'Origin: https://evil.example.com' \
  -d '{"title":"x","description":"x","price":1,"location":"x","category":"tools","contactNumber":"+15550001111"}')
check "cross-origin write is rejected" "$CODE" "403"

# --- Upload rejects a non-image ---------------------------------------------
echo "-- uploads --"
echo "not an image" > "$TMP_DIR/fake.jpg"
CODE=$(curl -s -o /dev/null -w '%{http_code}' -b "$COOKIES_A" -X POST "$BASE_URL/api/uploads" \
  -F "files=@$TMP_DIR/fake.jpg;type=image/jpeg")
check "non-image upload rejected" "$CODE" "415"

# --- Health -------------------------------------------------------------
echo "-- health --"
CODE=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/api/health")
check "health check returns 200" "$CODE" "200"

echo
echo "== $PASS passed, $FAIL failed =="
[[ "$FAIL" -eq 0 ]]
