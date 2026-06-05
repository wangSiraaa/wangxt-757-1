#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

BASE_URL="${BASE_URL:-http://localhost:4000}"
PASS=0
FAIL=0

ok() { echo "  ✅ $1"; PASS=$((PASS+1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL+1)); }

echo ""
echo "========================================"
echo "  招投标保证金退还 — 冒烟测试"
echo "========================================"
echo ""

echo "1. 健康检查"
HEALTH=$(curl -sf "$BASE_URL/api/health" 2>/dev/null || echo "")
if echo "$HEALTH" | grep -q '"success":true'; then
  ok "API 服务正常运行"
else
  fail "API 服务未启动 (尝试 $BASE_URL)"
  echo "  请先运行: npm run dev"
  exit 1
fi

echo ""
echo "2. 获取项目标段列表"
SECTIONS=$(curl -sf "$BASE_URL/api/sections")
SECTION_COUNT=$(echo "$SECTIONS" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('data',[])))" 2>/dev/null || echo "0")
if [ "$SECTION_COUNT" -gt 0 ]; then
  ok "标段列表返回 $SECTION_COUNT 条记录"
else
  fail "标段列表为空"
fi

echo ""
echo "3. 获取保证金流水"
BONDS=$(curl -sf "$BASE_URL/api/bonds")
BOND_COUNT=$(echo "$BONDS" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('data',[])))" 2>/dev/null || echo "0")
if [ "$BOND_COUNT" -gt 0 ]; then
  ok "保证金流水返回 $BOND_COUNT 条记录"
else
  fail "保证金流水为空"
fi

echo ""
echo "4. ★ 核心测试：对未开标标段发起退还并验证系统拒绝"
UNOPENED_BOND=$(echo "$BONDS" | python3 -c "
import sys, json
data = json.load(sys.stdin).get('data', [])
for b in data:
    if b.get('section_status') == 'unopened' and b.get('status') == 'paid':
        print(b['id'])
        break
else:
    print('')
" 2>/dev/null || echo "")

if [ -z "$UNOPENED_BOND" ]; then
  fail "未找到未开标标段的保证金流水，无法测试"
else
  REFUND_RESULT=$(curl -s -X POST "$BASE_URL/api/refunds" \
    -H "Content-Type: application/json" \
    -d "{\"bond_id\": $UNOPENED_BOND, \"reason\": \"冒烟测试-未开标标段退还\"}" 2>/dev/null || echo "")

  ERROR_MSG=$(echo "$REFUND_RESULT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('error', ''))
except:
    print('')
" 2>/dev/null || echo "")

  if echo "$ERROR_MSG" | grep -q "未开标"; then
    ok "系统正确拒绝未开标标段退还，提示：$ERROR_MSG"
  else
    fail "系统未拒绝未开标标段退还 (error: $ERROR_MSG)"
  fi
fi

echo ""
echo "5. 获取中标结果"
RESULTS=$(curl -sf "$BASE_URL/api/results")
RESULT_COUNT=$(echo "$RESULTS" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('data',[])))" 2>/dev/null || echo "0")
if [ "$RESULT_COUNT" -gt 0 ]; then
  ok "中标结果返回 $RESULT_COUNT 条记录"
else
  fail "中标结果为空"
fi

echo ""
echo "6. ★ 核心测试：中标人未签合同不能退保证金"
UNSIGNED_WINNER_BOND=$(echo "$BONDS" | python3 -c "
import sys, json
bonds_data = json.load(sys.stdin).get('data', [])
results_data = json.loads('''$RESULTS''').get('data', [])
for r in results_data:
    if not r.get('contract_signed'):
        winner = r.get('winner_name','')
        for b in bonds_data:
            if b.get('section_id') == r.get('section_id') and b.get('payer_name') == winner and b.get('status') == 'paid':
                print(b['id'])
                break
        break
else:
    print('')
" 2>/dev/null || echo "")

if [ -z "$UNSIGNED_WINNER_BOND" ]; then
  echo "  ⚠️  未找到未签约中标人的保证金，跳过此测试"
else
  REFUND_RESULT2=$(curl -s -X POST "$BASE_URL/api/refunds" \
    -H "Content-Type: application/json" \
    -d "{\"bond_id\": $UNSIGNED_WINNER_BOND, \"reason\": \"冒烟测试-中标人未签约退还\"}" 2>/dev/null || echo "")

  ERROR_MSG2=$(echo "$REFUND_RESULT2" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('error', ''))
except:
    print('')
" 2>/dev/null || echo "")

  if echo "$ERROR_MSG2" | grep -q "未签合同"; then
    ok "系统正确拒绝中标人未签约退还，提示：$ERROR_MSG2"
  else
    fail "系统未拒绝中标人未签约退还 (error: $ERROR_MSG2)"
  fi
fi

echo ""
echo "========================================"
echo "  测试结果：✅ $PASS 通过  ❌ $FAIL 失败"
echo "========================================"
echo ""

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
