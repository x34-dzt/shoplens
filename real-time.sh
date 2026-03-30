#!/usr/bin/env bash
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: ./real-time.sh <store_id>"
  echo "Example: ./real-time.sh str_01JFXXXXXX"
  exit 1
fi

STORE_ID="$1"
API_URL="${API_URL:-http://localhost:3001/api/v1}"
INTERVAL="${INTERVAL:-5}"

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

TOTAL=0
SUCCESS=0
FAIL=0

send_event() {
  local store_id="$1"
  local event_type="$2"
  local data="$3"

  local payload="{\"eventType\": \"$event_type\", \"data\": $data}"

  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$API_URL/events/$store_id" \
    -H "Content-Type: application/json" \
    -d "$payload")

  TOTAL=$((TOTAL + 1))

  if [ "$RESPONSE" = "201" ]; then
    SUCCESS=$((SUCCESS + 1))
  else
    FAIL=$((FAIL + 1))
    echo "  ✗ [$RESPONSE] $event_type"
  fi
}

trap 'echo ""; echo "Stopped. Total: $TOTAL | Success: $SUCCESS | Failed: $FAIL"; exit 0' INT

echo "Streaming events for store: $STORE_ID"
echo "API: $API_URL"
echo "Interval: ${INTERVAL}s"
echo "Press Ctrl+C to stop"
echo ""

while true; do
  EVENT_TYPE=$(pick_event_type)
  PRODUCT=$(pick_product)

  if [ "$EVENT_TYPE" = "purchase" ]; then
    AMOUNT=$((15 + RANDOM % 136)).$((RANDOM % 100))
    DATA="{\"productId\": \"$PRODUCT\", \"amount\": $AMOUNT, \"currency\": \"USD\"}"
  else
    DATA="{\"productId\": \"$PRODUCT\"}"
  fi

  send_event "$STORE_ID" "$EVENT_TYPE" "$DATA"

  NOW=$(date +"%H:%M:%S")
  if [ "$EVENT_TYPE" = "purchase" ]; then
    echo "[$NOW] $EVENT_TYPE → $PRODUCT (\$$AMOUNT)"
  else
    echo "[$NOW] $EVENT_TYPE → $PRODUCT"
  fi

  sleep "$INTERVAL"
done
