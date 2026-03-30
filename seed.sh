#!/usr/bin/env bash
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: ./seed.sh <store_id>"
  echo "Example: ./seed.sh str_01JFXXXXXX"
  exit 1
fi

STORE_ID="$1"
API_URL="${API_URL:-http://localhost:3001/api/v1}"

PRODUCTS=(
  "prod_wireless_headphones"
  "prod_running_shoes"
  "prod_coffee_maker"
  "prod_yoga_mat"
  "prod_backpack_pro"
  "prod_smart_watch"
  "prod_bluetooth_speaker"
  "prod_led_desk_lamp"
  "prod_water_bottle"
  "prod_mechanical_keyboard"
)

EVENT_TYPES=("page_view" "add_to_cart" "remove_from_cart" "checkout_started" "purchase")
EVENT_WEIGHTS=(50 20 5 15 10)

pick_event_type() {
  local rand=$((RANDOM % 100))
  if [ "$rand" -lt 50 ]; then echo "page_view"
  elif [ "$rand" -lt 70 ]; then echo "add_to_cart"
  elif [ "$rand" -lt 75 ]; then echo "remove_from_cart"
  elif [ "$rand" -lt 90 ]; then echo "checkout_started"
  else echo "purchase"
  fi
}

pick_product() {
  echo "${PRODUCTS[$((RANDOM % ${#PRODUCTS[@]}))]}"
}

pick_amount() {
  echo "$((15 + RANDOM % 136)).$((RANDOM % 100))"
}

TOTAL=0
SUCCESS=0
FAIL=0

send_event() {
  local store_id="$1"
  local event_type="$2"
  local data="$3"
  local timestamp="${4:-}"

  local payload="{\"eventType\": \"$event_type\", \"data\": $data"
  if [ -n "$timestamp" ]; then
    payload="$payload, \"timestamp\": \"$timestamp\""
  fi
  payload="$payload}"

  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$API_URL/events/$store_id" \
    -H "Content-Type: application/json" \
    -d "$payload")

  TOTAL=$((TOTAL + 1))

  if [ "$RESPONSE" = "201" ]; then
    SUCCESS=$((SUCCESS + 1))
  else
    FAIL=$((FAIL + 1))
    echo "FAIL [$RESPONSE] $event_type${timestamp:+ at $timestamp}"
  fi
}

echo "Seeding events for store: $STORE_ID"
echo "API: $API_URL"
echo ""

for day in $(seq 1 29); do
  EVENTS_TODAY=$((15 + RANDOM % 15))

  for i in $(seq 1 "$EVENTS_TODAY"); do
    EVENT_TYPE=$(pick_event_type)
    HOUR=$((RANDOM % 24))
    MIN=$((RANDOM % 60))
    SEC=$((RANDOM % 60))
    TIMESTAMP=$(date -u -d "-${day} days ${HOUR}:${MIN}:${SEC}" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -v-${day}d +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null)

    PRODUCT=$(pick_product)

    if [ "$EVENT_TYPE" = "purchase" ]; then
      AMOUNT=$((15 + RANDOM % 136)).$((RANDOM % 100))
      DATA="{\"productId\": \"$PRODUCT\", \"amount\": $AMOUNT, \"currency\": \"USD\"}"
    else
      DATA="{\"productId\": \"$PRODUCT\"}"
    fi

    send_event "$STORE_ID" "$EVENT_TYPE" "$DATA" "$TIMESTAMP"
  done

  echo "Day -$day: $EVENTS_TODAY events"
done

echo ""
echo "Seeding today's events..."

for product in "${PRODUCTS[@]}"; do
  send_event "$STORE_ID" "page_view" "{\"productId\": \"$product\"}"
  send_event "$STORE_ID" "page_view" "{\"productId\": \"$product\"}"
done

for product in "${PRODUCTS[@]}"; do
  send_event "$STORE_ID" "add_to_cart" "{\"productId\": \"$product\"}"
done

for i in $(seq 1 5); do
  PRODUCT=$(pick_product)
  send_event "$STORE_ID" "checkout_started" "{\"productId\": \"$PRODUCT\"}"
done

for product in "${PRODUCTS[@]}"; do
  AMOUNT=$((15 + RANDOM % 136)).$((RANDOM % 100))
  send_event "$STORE_ID" "purchase" "{\"productId\": \"$product\", \"amount\": $AMOUNT, \"currency\": \"USD\"}"
done

echo "Today: 10 page_views, 10 add_to_carts, 5 checkouts, 10 purchases"

echo ""
echo "Adding recent activity..."

for i in $(seq 1 5); do
  EVENT_TYPE=$(pick_event_type)
  PRODUCT=$(pick_product)
  if [ "$EVENT_TYPE" = "purchase" ]; then
    AMOUNT=$((15 + RANDOM % 136)).$((RANDOM % 100))
    DATA="{\"productId\": \"$PRODUCT\", \"amount\": $AMOUNT, \"currency\": \"USD\"}"
  else
    DATA="{\"productId\": \"$PRODUCT\"}"
  fi
  send_event "$STORE_ID" "$EVENT_TYPE" "$DATA"
  sleep 1
done

echo ""
echo "Done! Total: $TOTAL | Success: $SUCCESS | Failed: $FAIL"
