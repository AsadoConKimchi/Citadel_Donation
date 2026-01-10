# Backend Fixes Needed

**작성일**: 2026-01-10
**배포 후 발견된 백엔드 이슈 목록**

---

## 🚨 Critical Issues (기능 장애)

### 1. POW 시간 집계 오류 (`/api/rankings/by-category`)

**문제**: `total_minutes`가 항상 `0`으로 반환됨

**현재 API 응답**:
```json
{
  "rank": 1,
  "discord_id": "1340338561899303005",
  "discord_username": "A⚡ado 🌽 Kimchi",
  "total_minutes": 0,
  "session_count": 21,
  "last_activity_at": "2026-01-09T17:50:05.336262+00:00"
}
```

**기대 동작**:
- `session_count: 21`인데 `total_minutes`가 0인 것은 불가능
- `study_sessions` 테이블의 `duration_minutes` 컬럼을 정확히 집계해야 함

**영향**:
- ✅ 대시보드는 표시됨 (사용자 목록은 보임)
- ❌ POW 시간이 0분으로 표시되어 의미 없는 랭킹

**백엔드 파일**: `/Users/jinito/Citadel_POW_BackEND/src/routes/rankings.ts`

**추정 원인**:
```sql
-- 잘못된 SQL 예시
SELECT
  user_id,
  COUNT(*) as session_count,
  0 as total_minutes  -- ← 하드코딩된 0
FROM study_sessions
GROUP BY user_id;

-- 올바른 SQL
SELECT
  user_id,
  COUNT(*) as session_count,
  SUM(duration_minutes) as total_minutes  -- ← 집계 필요
FROM study_sessions
GROUP BY user_id;
```

---

### 2. 기부액 집계 오류 (`/api/donations/top`)

**문제**: 사용자별 누적 기부액이 정확히 집계되지 않음

**현재 상태**:
- 실제 기부 내역: 8 sats + 38 sats = **46 sats**
- API 응답: `total_donated: 8` ← 첫 번째 기부만 집계됨

**현재 API 응답**:
```json
{
  "discord_username": "A⚡ado 🌽 Kimchi",
  "discord_avatar": "f747b19434ea55fc4d0bde6ae725669c",
  "total_donated": 8,
  "donation_count": 1,
  "last_donation_at": "2026-01-10T05:19:35.10229+00:00"
}
```

**기대 응답**:
```json
{
  "discord_username": "A⚡ado 🌽 Kimchi",
  "total_donated": 46,
  "donation_count": 2,
  "last_donation_at": "..."
}
```

**영향**:
- ❌ Top 5 대시보드 순위 부정확
- ❌ 사용자 누적 기부액 부정확

**백엔드 파일**: `/Users/jinito/Citadel_POW_BackEND/src/routes/donations.ts`

**추정 원인**:
- `GROUP BY` 집계 시 `SUM(amount)` 누락
- 또는 `WHERE` 절에서 일부 기부만 필터링됨

---

### 3. `discord_id` 누락 (`/api/donations/top`)

**문제**: API 응답에 `discord_id` 필드가 없음

**현재 API 응답**:
```json
{
  "discord_username": "A⚡ado 🌽 Kimchi",
  "discord_avatar": "f747b19434ea55fc4d0bde6ae725669c",
  "total_donated": 8
}
```

**기대 응답**:
```json
{
  "discord_id": "1340338561899303005",  // ← 필수!
  "discord_username": "A⚡ado 🌽 Kimchi",
  "discord_avatar": "f747b19434ea55fc4d0bde6ae725669c",
  "total_donated": 46
}
```

**영향**:
- ⚠️ 프로필 사진 URL 생성 불가 (`https://cdn.discordapp.com/avatars/{discord_id}/{avatar}.png`)
- ✅ **프론트엔드 폴백 추가됨**: `discord_id` 없을 때 username 첫 글자를 색상 원으로 표시

**백엔드 파일**: `/Users/jinito/Citadel_POW_BackEND/src/routes/donations.ts`

**수정 방법**:
```typescript
// donations.ts에서 SELECT 절에 discord_id 추가
const result = await env.DB.prepare(`
  SELECT
    u.discord_id,        -- ← 추가 필요
    u.discord_username,
    u.discord_avatar,
    SUM(d.amount) as total_donated,
    COUNT(*) as donation_count,
    MAX(d.created_at) as last_donation_at
  FROM donations d
  JOIN users u ON d.user_id = u.id
  WHERE d.status = 'completed'
  GROUP BY u.id, u.discord_id, u.discord_username, u.discord_avatar
  ORDER BY total_donated DESC
  LIMIT ?
`).bind(limit).all();
```

---

## ⚠️ Medium Issues (기능 제한)

### 4. 인기 기록 없음 (`/api/discord-posts/popular`)

**문제**: `discord_posts` 테이블이 비어있음

**현재 API 응답**:
```json
{
  "success": true,
  "data": [],
  "count": 0
}
```

**원인**:
1. Discord 봇이 반응 수를 수집하지 않음
2. `discord_posts` 테이블에 데이터가 삽입되지 않음

**영향**:
- ❌ "인기 기록" 탭에 "아직 인기 기록이 없습니다" 메시지 표시
- ❌ 디스코드 반응 기반 Top 5 기능 사용 불가

**해결 방법**:
1. Discord 봇에서 `messageCreate` 이벤트 리스너 추가
2. POW 인증카드가 디스코드에 전송될 때 `discord_posts` 테이블에 삽입
3. `messageReactionAdd` 이벤트로 반응 수 업데이트

**백엔드 파일**:
- `/Users/jinito/Citadel_POW_BackEND/src/discord-bot/index.ts` (Discord 봇)
- `/Users/jinito/Citadel_POW_BackEND/src/routes/discord-posts.ts` (API)

**참고**: `discord_posts` 테이블은 이미 생성되어 있음 (Phase 1에서 마이그레이션 완료)

---

## ✅ Frontend Fixes Applied (프론트엔드 수정 완료)

### 1. 탭 명칭 변경
- "나의 POW 기록" → "나의 POW"
- "기부 기록" → "Donation"

### 2. 아바타 폴백 추가
- `discord_id` 없을 때 username 첫 글자를 색상 원으로 표시
- 8가지 색상 팔레트로 사용자별 고유 색상 할당
- 모바일 반응형 스타일 적용

**파일**:
- `components/leaderboard.js` (lines 140-151)
- `styles.css` (lines 1148-1160, 1372-1376)

---

## 📝 Backend Fix Checklist

### Critical (즉시 수정 필요)
- [ ] `total_minutes` 집계 수정 (`/api/rankings/by-category`)
- [ ] `total_donated` 집계 수정 (`/api/donations/top`)
- [ ] `discord_id` 필드 추가 (`/api/donations/top`)

### Medium (기능 추가)
- [ ] Discord 봇 반응 수집 기능 구현
- [ ] `discord_posts` 테이블 데이터 삽입

---

## 🧪 Testing After Backend Fixes

수정 후 다음 API를 테스트하세요:

```bash
# 1. POW 시간 랭킹 (total_minutes > 0 확인)
curl "https://citadel-pow-backend.magadenuevo2025.workers.dev/api/rankings/by-category?type=time&category=all&limit=10"

# 2. 기부 Top 5 (discord_id 존재, total_donated 정확 확인)
curl "https://citadel-pow-backend.magadenuevo2025.workers.dev/api/donations/top?category=all&limit=5"

# 3. 인기 기록 (data.length > 0 확인)
curl "https://citadel-pow-backend.magadenuevo2025.workers.dev/api/discord-posts/popular?category=all&limit=5"
```

**Expected Results**:
1. `total_minutes` should match `SUM(duration_minutes)` from DB
2. `total_donated` should match `SUM(amount)` for user (e.g., 8 + 38 = 46)
3. `discord_id` should be present in all user objects
4. `data` array should contain popular posts (after bot implementation)

---

**작성자**: Claude Code
**날짜**: 2026-01-10
