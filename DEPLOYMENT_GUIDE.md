# Citadel POW 배포 가이드

**작성일**: 2026-01-10
**버전**: 2.0.0

---

## 📋 목차

1. [배포 개요](#배포-개요)
2. [사전 준비](#사전-준비)
3. [백엔드 배포](#백엔드-배포)
4. [프론트엔드 배포](#프론트엔드-배포)
5. [배포 후 확인](#배포-후-확인)
6. [롤백 절차](#롤백-절차)
7. [트러블슈팅](#트러블슈팅)

---

## 배포 개요

### 변경 사항 요약
- **UI 개편**: 3개 탭 → 4개 탭
- **컴포넌트 시스템**: Carousel, Leaderboard, Filter, TabSwitcher
- **성능 최적화**: API 캐싱, 이미지 lazy loading
- **모니터링**: 성능 측정 도구 추가

### 배포 환경
- **백엔드**: Cloudflare Workers
- **프론트엔드**: GitHub Pages / Cloudflare Pages
- **데이터베이스**: Supabase PostgreSQL

---

## 사전 준비

### 1. 백엔드 API 확인

프로덕션 백엔드 API가 정상 작동하는지 확인합니다.

```bash
# 백엔드 URL
BACKEND_URL="https://citadel-pow-backend.magadenuevo2025.workers.dev"

# 신규 API 엔드포인트 테스트
curl "$BACKEND_URL/api/discord-posts/popular?category=all&limit=5"
curl "$BACKEND_URL/api/rankings/by-category?type=time&category=all&limit=10"
curl "$BACKEND_URL/api/donations/top?category=all&limit=5"
```

**예상 응답**:
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

### 2. 백엔드 마이그레이션 확인

Supabase에서 `discord_posts` 테이블이 생성되어 있는지 확인합니다.

```sql
-- Supabase SQL Editor에서 실행
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'discord_posts';
```

**테이블이 없다면**:
```bash
cd ../Citadel_POW_BackEND
npx supabase db push
```

### 3. Git 태그 생성

배포 전 Git 태그를 생성하여 버전을 관리합니다.

```bash
cd /Users/jinito/Citadel_POW

# 현재 상태 확인
git status

# 태그 생성
git tag -a v2.0.0 -m "feat: 대규모 프론트엔드 개편 - 4개 탭, 컴포넌트 시스템, 성능 최적화"

# 태그 푸시
git push origin v2.0.0
```

---

## 백엔드 배포

### 1. 백엔드 코드 확인

백엔드가 이미 배포되어 있는 경우, 신규 API 엔드포인트가 포함되어 있는지 확인합니다.

```bash
cd /Users/jinito/Citadel_POW_BackEND

# 최신 코드 확인
git log --oneline -5

# 신규 엔드포인트 파일 확인
ls src/routes/discord-posts.ts
ls src/routes/rankings.ts
```

### 2. 백엔드 배포 (필요시)

백엔드 코드가 업데이트되지 않았다면 배포합니다.

```bash
# Cloudflare Workers 배포
npm run deploy

# 또는
wrangler deploy
```

### 3. 백엔드 배포 확인

```bash
# 배포된 백엔드 API 테스트
curl "https://citadel-pow-backend.magadenuevo2025.workers.dev/api/discord-posts/popular?category=all&limit=5"
```

---

## 프론트엔드 배포

### 옵션 1: GitHub Pages

#### 1.1 GitHub Pages 활성화

1. GitHub 저장소로 이동: https://github.com/AsadoConKimchi/Citadel_POW
2. **Settings** > **Pages** 클릭
3. **Source**: `main` 브랜치 선택
4. **Folder**: `/ (root)` 선택
5. **Save** 클릭

#### 1.2 배포 URL 확인

- GitHub Pages URL: `https://asadoconkimchi.github.io/Citadel_POW/`
- 커스텀 도메인 설정 가능 (선택)

#### 1.3 HTTPS 활성화

- **Settings** > **Pages**에서 "Enforce HTTPS" 체크

#### 1.4 배포 상태 확인

- **Actions** 탭에서 배포 진행 상황 확인
- 녹색 체크 표시: 배포 성공
- 빨간 X 표시: 배포 실패 (로그 확인)

### 옵션 2: Cloudflare Pages

#### 2.1 Cloudflare Pages 프로젝트 생성

1. Cloudflare Dashboard: https://dash.cloudflare.com/
2. **Pages** > **Create a project** 클릭
3. **Connect to Git** 선택
4. GitHub 저장소 연결: `AsadoConKimchi/Citadel_POW`

#### 2.2 빌드 설정

- **Framework preset**: None
- **Build command**: (비워둠, 정적 사이트)
- **Build output directory**: `/`
- **Root directory**: `/`

#### 2.3 환경 변수 설정 (선택)

- Production 환경 변수 추가 (필요시)

#### 2.4 배포 트리거

- `main` 브랜치에 푸시하면 자동 배포
- 또는 Cloudflare Dashboard에서 수동 배포

#### 2.5 배포 URL 확인

- Cloudflare Pages URL: `https://citadel-pow.pages.dev/`
- 커스텀 도메인 설정 가능

### 옵션 3: 로컬 서버 (개발/테스트용)

```bash
cd /Users/jinito/Citadel_POW

# Python 3 내장 서버
python3 -m http.server 8000

# 또는 Node.js http-server (설치 필요)
npx http-server -p 8000

# 브라우저에서 접속
# http://localhost:8000/
```

---

## 배포 후 확인

### 1. 기본 기능 테스트

#### 1.1 페이지 접속 확인

브라우저에서 다음 URL에 접속하여 모든 페이지가 로드되는지 확인합니다.

```
https://your-domain.com/index.html
https://your-domain.com/study-history.html
https://your-domain.com/my-pow-records.html
https://your-domain.com/donation-history.html
```

#### 1.2 네비게이션 확인

- 4개 탭 모두 클릭 가능한지 확인
- Active 클래스가 올바르게 적용되는지 확인
- 페이지 전환이 정상적으로 작동하는지 확인

#### 1.3 API 연결 확인

브라우저 콘솔에서 확인:

```javascript
// 1. 백엔드 URL 확인
console.log(window.BACKEND_API_URL);
// 예상 출력: "https://citadel-pow-backend.magadenuevo2025.workers.dev"

// 2. 캐시 통계 확인
window.cacheManager.getStats();

// 3. 성능 리포트 확인
showPerformanceReport();
```

### 2. 성능 확인

#### 2.1 페이지 로딩 시간

브라우저 개발자 도구 > **Network** 탭:
- DOMContentLoaded: < 2초
- Load: < 3초

#### 2.2 API 캐싱

1. 페이지 새로고침 (Ctrl+R)
2. study-history.html 접속
3. 콘솔에서 확인:
   ```javascript
   window.cacheManager.getStats();
   // memory.count > 0 확인
   // storage.count > 0 확인
   ```

#### 2.3 이미지 Lazy Loading

브라우저 개발자 도구 > **Network** 탭:
- Filter: `Img`
- 초기 로딩 시 1-2개 이미지만 로드되는지 확인
- 스크롤 시 추가 이미지 로드되는지 확인

### 3. 브라우저 호환성 확인

최소 다음 브라우저에서 테스트:
- [ ] Chrome (최신)
- [ ] Safari (최신)
- [ ] Firefox (최신)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### 4. 에러 로그 확인

브라우저 콘솔에서 에러가 없는지 확인:
- 빨간색 에러 메시지 없음
- 노란색 경고는 무시 가능 (성능 경고 등)

---

## 롤백 절차

배포 후 문제가 발생하면 이전 버전으로 롤백합니다.

### 1. Git 롤백

```bash
cd /Users/jinito/Citadel_POW

# 이전 태그 확인
git tag -l

# 이전 태그로 롤백 (예: v1.0.0)
git checkout v1.0.0

# 롤백 커밋 생성
git checkout -b rollback-v1.0.0
git push origin rollback-v1.0.0
```

### 2. GitHub Pages 롤백

1. GitHub 저장소 > **Settings** > **Pages**
2. **Source** 브랜치를 `rollback-v1.0.0`으로 변경

### 3. Cloudflare Pages 롤백

1. Cloudflare Dashboard > **Pages** > 프로젝트 선택
2. **Deployments** 탭
3. 이전 배포 선택
4. **Rollback to this deployment** 클릭

---

## 트러블슈팅

### 문제 1: 페이지가 로드되지 않음

**증상**: 흰 화면 또는 404 에러

**해결 방법**:
1. 브라우저 콘솔에서 에러 확인
2. 파일 경로 확인 (대소문자 구분)
3. GitHub Pages/Cloudflare Pages 배포 상태 확인

### 문제 2: API 호출 실패

**증상**: "데이터를 불러올 수 없습니다" 메시지

**해결 방법**:
1. 백엔드 URL 확인:
   ```javascript
   console.log(window.BACKEND_API_URL);
   ```
2. CORS 설정 확인 (백엔드)
3. 백엔드 API 정상 작동 확인:
   ```bash
   curl "https://citadel-pow-backend.magadenuevo2025.workers.dev/api/rankings/by-category?type=time&category=all&limit=10"
   ```

### 문제 3: 캐싱이 작동하지 않음

**증상**: API가 매번 호출됨

**해결 방법**:
1. localStorage 확인:
   ```javascript
   localStorage.length
   Object.keys(localStorage).filter(k => k.startsWith('cache:'))
   ```
2. 시크릿 모드에서 테스트 (localStorage 비활성화)
3. 캐시 디버그 모드 활성화:
   ```javascript
   window.cacheManager.setDebug(true);
   ```

### 문제 4: 이미지가 로드되지 않음

**증상**: 이미지 깨짐 또는 alt 텍스트만 표시

**해결 방법**:
1. 이미지 URL 확인 (콘솔에서)
2. CORS 설정 확인 (이미지 서버)
3. 네트워크 탭에서 이미지 요청 확인

### 문제 5: 모바일에서 스와이프가 작동하지 않음

**증상**: Carousel 스와이프 불가

**해결 방법**:
1. 터치 이벤트 리스너 확인
2. CSS `touch-action` 확인
3. 모바일 브라우저 개발자 도구에서 디버깅

---

## 배포 체크리스트

배포 전 다음 항목을 확인하세요:

- [ ] 백엔드 API 정상 작동
- [ ] 프로덕션 백엔드 URL 정확함 (config.js)
- [ ] Git 태그 생성 (v2.0.0)
- [ ] 모든 변경사항 커밋 및 푸시
- [ ] DEPLOYMENT_CHECKLIST.md 체크리스트 완료
- [ ] 브라우저 호환성 테스트 완료
- [ ] 성능 테스트 완료

배포 후 다음 항목을 확인하세요:

- [ ] 모든 페이지 정상 로드
- [ ] 네비게이션 정상 작동
- [ ] API 호출 정상
- [ ] 캐싱 정상 작동
- [ ] 이미지 lazy loading 작동
- [ ] 성능 메트릭 확인 (페이지 로딩 < 2초)
- [ ] 에러 로그 확인 (에러 없음)

---

## 지원 및 피드백

문제가 발생하거나 피드백이 있는 경우:

- **GitHub Issues**: https://github.com/AsadoConKimchi/Citadel_POW/issues
- **Discord**: (커뮤니티 링크)

---

**작성일**: 2026-01-10
**작성자**: Claude Code
**버전**: 2.0.0
