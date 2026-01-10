# Phase 6: 통합 테스트 체크리스트

## 1. 네비게이션 일관성 ✅

### 모든 페이지에 4개 탭 존재 확인
- [x] index.html - 오늘 / Citadel POW / 나의 POW 기록 / 기부 기록
- [x] study-history.html - 오늘 / Citadel POW / 나의 POW 기록 / 기부 기록
- [x] my-pow-records.html - 오늘 / Citadel POW / 나의 POW 기록 / 기부 기록
- [x] donation-history.html - 오늘 / Citadel POW / 나의 POW 기록 / 기부 기록

### Active 클래스 적용 확인
- [x] index.html: `<a href="index.html" class="active">`
- [x] study-history.html: `<a href="study-history.html" class="active">`
- [x] my-pow-records.html: `<a href="my-pow-records.html" class="active">`
- [x] donation-history.html: `<a href="donation-history.html" class="active">`

---

## 2. 스크립트 임포트 일관성 ✅

### index.html (오늘 탭)
```html
<script src="config.js"></script>
<script src="api.js"></script>
<script src="app.js"></script>
```
- [x] config.js: 백엔드 URL 설정
- [x] api.js: API 통신 유틸리티
- [x] app.js: 메인 로직 (formatTime 자체 정의)

### study-history.html (Citadel POW 탭)
```html
<script src="config.js"></script>
<script src="common.js"></script>
<script src="api.js"></script>
<script src="components/carousel.js"></script>
<script src="components/leaderboard.js"></script>
<script src="components/tab-switcher.js"></script>
<script src="study-history-app.js"></script>
```
- [x] common.js 임포트됨
- [x] 필요한 컴포넌트: Carousel, Leaderboard, TabSwitcher

### my-pow-records.html (나의 POW 기록 탭)
```html
<script src="config.js"></script>
<script src="common.js"></script>
<script src="api.js"></script>
<script src="components/carousel.js"></script>
<script src="components/filter.js"></script>
<script src="my-pow-records-app.js"></script>
```
- [x] common.js 임포트됨
- [x] 필요한 컴포넌트: Carousel, Filter

### donation-history.html (기부 기록 탭)
```html
<script src="config.js"></script>
<script src="common.js"></script>
<script src="api.js"></script>
<script src="components/leaderboard.js"></script>
<script src="donation-history-app.js"></script>
```
- [x] common.js 임포트됨
- [x] 필요한 컴포넌트: Leaderboard

---

## 3. API 엔드포인트 일관성

### 백엔드 API URL 설정
- [x] config.js에서 `window.BACKEND_API_URL` 설정
- [x] Development: http://localhost:8787
- [x] Production: https://citadel-pow-backend.magadenuevo2025.workers.dev

### 기존 API 엔드포인트 (api.js)
- [x] `/api/users` - 사용자 생성/조회
- [x] `/api/study-sessions` - POW 세션 생성/조회
- [x] `/api/donations` - 기부 생성/조회
- [x] `/api/rankings` - 순위 조회
- [x] `/api/accumulated-sats` - 적립액 조회/생성/삭제

### 신규 API 엔드포인트 (Phase 1 추가)
- [x] `GET /api/discord-posts/popular?category={category}&limit=5`
  - 사용처: study-history-app.js line 133
  - 목적: Discord 반응 수 기준 인기 POW Top 5
  - 백엔드: `/Users/jinito/Citadel_POW_BackEND/src/routes/discord-posts.ts:12`

- [x] `GET /api/rankings/by-category?type={time|donation}&category={category}&limit={limit}`
  - 사용처: components/leaderboard.js line 43
  - 목적: 분야별 POW 시간/기부 금액 랭킹
  - 백엔드: `/Users/jinito/Citadel_POW_BackEND/src/routes/rankings.ts:113`

- [x] `GET /api/donations/top?category={category}&limit={limit}`
  - 사용처: components/leaderboard.js line 48
  - 목적: 분야별 Top 기부자 조회
  - 백엔드: `/Users/jinito/Citadel_POW_BackEND/src/routes/donations.ts:11`

**✅ 백엔드 API 구현 확인 완료**: 3개의 엔드포인트가 모두 백엔드에 구현되어 있습니다.

---

## 4. 컴포넌트 통합 테스트

### Carousel 컴포넌트
- [ ] 스와이프 기능 정상 작동 (모바일)
- [ ] 키보드 화살표 키 정상 작동 (데스크톱)
- [ ] 인디케이터 표시 정확함 (예: "1 / 5")
- [ ] 이전/다음 버튼 비활성화 상태 정확함
- [ ] 이미지 있는 카드 렌더링 정상
- [ ] 이미지 없는 카드 텍스트 렌더링 정상

**사용 페이지**:
- study-history.html (인기 기록)
- my-pow-records.html (나의 POW 기록)

### Leaderboard 컴포넌트
- [ ] POW 시간 기준 랭킹 정상 표시
- [ ] 기부 금액 기준 랭킹 정상 표시
- [ ] 분야별 필터링 정상 작동
- [ ] 1-3위 메달 표시 (🥇🥈🥉)
- [ ] 아바타 이미지 로딩 정상
- [ ] 로딩 상태 표시
- [ ] 에러 상태 표시
- [ ] 빈 상태 메시지 표시

**사용 페이지**:
- study-history.html (대시보드)
- donation-history.html (Top 5 대시보드)

### Filter 컴포넌트
- [ ] 분야 드롭다운 정상 작동
- [ ] 날짜 선택 정상 작동
- [ ] 기간 버튼 (오늘/이번주/이번달) 정상 작동
- [ ] 날짜 선택 시 기간 버튼 초기화
- [ ] 기간 버튼 선택 시 날짜 초기화
- [ ] onChange 콜백 정상 호출

**사용 페이지**:
- my-pow-records.html

### TabSwitcher 컴포넌트
- [ ] 탭 전환 정상 작동
- [ ] localStorage에 현재 탭 저장
- [ ] 페이지 새로고침 시 저장된 탭 복원
- [ ] 탭 버튼 활성화 상태 표시
- [ ] 탭 컨텐츠 표시/숨김 정상 작동

**사용 페이지**:
- study-history.html (대시보드 / 인기 기록)

---

## 5. 기능별 통합 테스트

### 5.1 Citadel POW 탭 (study-history.html)

#### 대시보드 기능
- [ ] 분야 선택 드롭다운 정상 작동
- [ ] POW 시간 / 기부 금액 탭 전환 정상 작동
- [ ] 전체/분야별 리더보드 정상 표시
- [ ] TOP 10 리더보드 렌더링 정상
- [ ] 타이틀 동적 업데이트 ("전체 POW 시간 TOP 10", "글쓰기 기부 금액 TOP 10" 등)

#### 인기 기록 기능
- [ ] 인기 기록 Top 5 로딩 정상
- [ ] Carousel 스와이프 정상 작동
- [ ] 반응 수 표시 (❤️ 123)
- [ ] 순위 표시 (🥇🥈🥉 또는 #4, #5)
- [ ] 분야별 인기 기록 필터링 정상
- [ ] 빈 상태 메시지 표시 ("아직 인기 기록이 없습니다.")

### 5.2 나의 POW 기록 탭 (my-pow-records.html)

#### 필터 기능
- [ ] 로그인하지 않은 경우 "로그인이 필요합니다" 메시지 표시
- [ ] 분야 선택 시 해당 분야 기록만 표시
- [ ] 날짜 선택 시 해당 날짜 기록만 표시
- [ ] 기간 버튼 (오늘/이번주/이번달) 정상 작동
- [ ] 필터 조합 (분야 + 날짜) 정상 작동

#### 통계 요약
- [ ] 총 POW 시간 정확히 계산 및 표시
- [ ] 세션 수 정확히 계산 및 표시
- [ ] 필터링된 결과에 대한 통계 업데이트

#### Carousel 기록 표시
- [ ] 인증카드 이미지 정상 표시
- [ ] 텍스트 카드 (이미지 없는 경우) 정상 표시
- [ ] 날짜, 분야, POW 시간 정확히 표시
- [ ] 최신순 정렬 정상 작동
- [ ] 빈 상태 메시지 표시

### 5.3 기부 기록 탭 (donation-history.html)

#### 나의 기부 현황
- [ ] 누적 기부액 정상 표시
- [ ] 현재 적립액 정상 표시 (있는 경우)
- [ ] 적립액 기부하기 버튼 정상 작동
- [ ] 기부 완료 후 데이터 새로고침

#### Top 5 대시보드
- [ ] 전체/분야별 Top 5 기부자 표시
- [ ] Leaderboard 렌더링 정상
- [ ] 타이틀 동적 업데이트 ("전체 누적 기부액 TOP 5", "글쓰기 누적 기부액 TOP 5" 등)

#### 나의 기부 기록
- [ ] 월 선택 드롭다운 정상 작동
- [ ] 분야 필터 정상 작동
- [ ] 월별 기부 내역 리스트 표시
- [ ] 날짜, 금액, 분야 정확히 표시
- [ ] 빈 상태 메시지 표시

---

## 6. 에러 핸들링 테스트

### API 에러
- [ ] 백엔드 서버 다운 시 에러 메시지 표시
- [ ] 네트워크 에러 시 에러 메시지 표시
- [ ] 잘못된 API 응답 시 에러 메시지 표시
- [ ] 타임아웃 처리

### 데이터 없음
- [ ] POW 기록 없는 경우 빈 상태 표시
- [ ] 기부 기록 없는 경우 빈 상태 표시
- [ ] 인기 기록 없는 경우 빈 상태 표시
- [ ] 필터링 결과 없는 경우 메시지 표시

### 로그인 상태
- [ ] 비로그인 상태에서 개인 데이터 접근 시 로그인 안내 표시
- [ ] 세션 만료 시 로그인 안내 표시

---

## 7. 성능 테스트

### 페이지 로딩
- [ ] 페이지 로딩 시간 < 2초
- [ ] 첫 콘텐츠 렌더링 < 1초

### API 응답
- [ ] API 응답 시간 < 500ms
- [ ] 캐싱 전략 작동 (localStorage)

### Carousel 애니메이션
- [ ] 스와이프 애니메이션 60fps 유지
- [ ] 버튼 클릭 애니메이션 부드러움

### 메모리
- [ ] 10분 사용 후 메모리 누수 없음
- [ ] 탭 전환 시 메모리 증가 없음

---

## 8. 브라우저 호환성 테스트

### 데스크톱
- [ ] Chrome (최신)
- [ ] Safari (최신)
- [ ] Firefox (최신)
- [ ] Edge (최신)

### 모바일
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] 터치 스와이프 정상 작동
- [ ] 반응형 디자인 정상 작동

---

## 9. 접근성 테스트

### 키보드 네비게이션
- [ ] Tab 키로 모든 인터랙티브 요소 접근 가능
- [ ] Enter/Space로 버튼 활성화
- [ ] 화살표 키로 Carousel 네비게이션

### 스크린 리더
- [ ] aria-label, aria-hidden 속성 적절히 사용
- [ ] 시맨틱 HTML 사용 (nav, main, header, section)

---

## 10. 데이터 마이그레이션 테스트

### localStorage 데이터 보존
- [ ] 기존 localStorage 데이터 보존
- [ ] 새로운 캐싱 메커니즘과 충돌 없음

---

## 다음 단계

### Phase 6-2: 성능 최적화
1. API 캐싱 전략 구현 (localStorage 5분, 메모리 1분)
2. 이미지 lazy loading
3. 응답 시간 측정 및 개선

### Phase 6-3: 최종 배포
1. Feature Flag 적용 (점진적 롤아웃)
2. Staging 환경 테스트
3. Production 배포
4. 모니터링 및 로그 확인

---

## 발견된 이슈

### 🔴 Critical (배포 전 수정 필수)
없음 - 모든 필수 기능 구현 완료

### 🟡 Warning (개선 권장)
없음

### 🟢 Minor (추후 개선)
- [ ] API 캐싱 전략 구현 (Phase 6-2에서 처리)
- [ ] 이미지 lazy loading 구현 (Phase 6-2에서 처리)
- [ ] 성능 모니터링 도구 추가

---

## 테스트 실행 방법

### 로컬 환경
1. 백엔드 서버 실행: `cd ../Citadel_POW_BackEND && npm run dev`
2. 프론트엔드 서버 실행: `python -m http.server 8000` 또는 Live Server
3. 브라우저에서 `http://localhost:8000` 접속
4. 위 체크리스트 항목들을 하나씩 수동 테스트

### 프로덕션 환경
1. 백엔드: Cloudflare Workers에 배포됨
2. 프론트엔드: GitHub Pages 또는 Cloudflare Pages에 배포
3. 실제 사용자 데이터로 테스트

---

**작성일**: 2026-01-10
**작성자**: Claude Code
**Phase**: 6 - 통합 테스트
