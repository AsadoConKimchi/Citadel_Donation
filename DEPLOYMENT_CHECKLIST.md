# Phase 6-3: 배포 전 최종 검토 체크리스트

**작성일**: 2026-01-10
**Phase**: 6-3 - 최종 배포 준비

---

## 🎯 배포 목표

Citadel POW 프론트엔드 대규모 개편 프로젝트를 프로덕션 환경에 안정적으로 배포합니다.

**변경 사항 요약**:
- 3개 탭 → 4개 탭 (오늘 / Citadel POW / 나의 POW 기록 / 기부 기록)
- 재사용 가능한 컴포넌트 시스템 (Carousel, Leaderboard, Filter, TabSwitcher)
- API 캐싱 전략 (메모리 1분 + localStorage 5분)
- 이미지 lazy loading
- 성능 측정 도구

---

## ✅ 배포 전 체크리스트

### 1. 코드 품질 검증

#### 1.1 파일 구조 확인
- [x] 모든 HTML 페이지 존재 확인
  - [x] index.html
  - [x] study-history.html
  - [x] my-pow-records.html
  - [x] donation-history.html
- [x] 컴포넌트 파일 존재 확인
  - [x] components/carousel.js
  - [x] components/leaderboard.js
  - [x] components/filter.js
  - [x] components/tab-switcher.js
- [x] 공통 스크립트 파일 존재 확인
  - [x] config.js
  - [x] common.js
  - [x] api.js
  - [x] cache-manager.js
  - [x] performance-monitor.js
- [x] 페이지별 앱 스크립트 존재 확인
  - [x] app.js
  - [x] study-history-app.js
  - [x] my-pow-records-app.js
  - [x] donation-history-app.js

#### 1.2 스크립트 임포트 순서 확인
- [ ] **study-history.html**:
  ```
  config.js → performance-monitor.js → cache-manager.js
  → common.js → api.js → components → study-history-app.js
  ```
- [ ] **my-pow-records.html**:
  ```
  config.js → performance-monitor.js → cache-manager.js
  → common.js → api.js → components → my-pow-records-app.js
  ```
- [ ] **donation-history.html**:
  ```
  config.js → performance-monitor.js → cache-manager.js
  → common.js → api.js → components → donation-history-app.js
  ```

#### 1.3 네비게이션 일관성 확인
- [ ] 모든 HTML 페이지에 4개 탭 존재
- [ ] Active 클래스 올바르게 적용
- [ ] 링크 URL 정확함

---

### 2. 기능 테스트

#### 2.1 Citadel POW 탭 (study-history.html)

**대시보드 기능**:
- [ ] 분야 드롭다운 정상 작동 (전체/글쓰기/음악/공부/그림/독서/봉사)
- [ ] POW 시간 탭 선택 시 리더보드 업데이트
- [ ] 기부 금액 탭 선택 시 리더보드 업데이트
- [ ] TOP 10 리더보드 렌더링 정상
- [ ] 1-3위 메달 표시 (🥇🥈🥉)
- [ ] 사용자 아바타 이미지 로딩 정상
- [ ] 타이틀 동적 업데이트 확인

**인기 기록 기능**:
- [ ] 인기 기록 Top 5 로딩 정상
- [ ] Carousel 스와이프 정상 작동 (모바일)
- [ ] 키보드 화살표 키 정상 작동 (데스크톱)
- [ ] 인디케이터 표시 ("1 / 5")
- [ ] 반응 수 표시 (❤️ N)
- [ ] 순위 표시 (🥇🥈🥉 또는 #4, #5)
- [ ] 분야별 인기 기록 필터링 정상
- [ ] 빈 상태 메시지 표시

#### 2.2 나의 POW 기록 탭 (my-pow-records.html)

**로그인 상태**:
- [ ] 로그인하지 않은 경우 "로그인이 필요합니다" 메시지 표시
- [ ] 로그인 후 필터 패널 및 기록 표시

**필터 기능**:
- [ ] 분야 선택 시 해당 분야 기록만 표시
- [ ] 날짜 선택 시 해당 날짜 기록만 표시
- [ ] 기간 버튼 (오늘/이번주/이번달) 정상 작동
- [ ] 날짜 선택 시 기간 버튼 비활성화
- [ ] 기간 버튼 선택 시 날짜 초기화

**통계 요약**:
- [ ] 총 POW 시간 정확히 계산 및 표시
- [ ] 세션 수 정확히 계산 및 표시
- [ ] 필터링된 결과에 대한 통계 업데이트

**Carousel 기록 표시**:
- [ ] 인증카드 이미지 정상 표시
- [ ] 텍스트 카드 (이미지 없는 경우) 정상 표시
- [ ] 날짜, 분야, POW 시간 정확히 표시
- [ ] 최신순 정렬 정상 작동
- [ ] 스와이프 및 키보드 네비게이션 정상
- [ ] 빈 상태 메시지 표시

#### 2.3 기부 기록 탭 (donation-history.html)

**나의 기부 현황**:
- [ ] 누적 기부액 정상 표시
- [ ] 현재 적립액 정상 표시 (있는 경우)
- [ ] 적립액 기부하기 버튼 정상 작동
- [ ] 기부 완료 후 데이터 새로고침

**Top 5 대시보드**:
- [ ] 분야 드롭다운 정상 작동
- [ ] 전체/분야별 Top 5 기부자 표시
- [ ] Leaderboard 렌더링 정상
- [ ] 타이틀 동적 업데이트

**나의 기부 기록**:
- [ ] 월 선택 드롭다운 정상 작동
- [ ] 분야 필터 정상 작동
- [ ] 월별 + 분야별 필터 조합 정상
- [ ] 기부 내역 리스트 표시 (날짜, 금액, 분야)
- [ ] 빈 상태 메시지 표시

---

### 3. 성능 테스트

#### 3.1 페이지 로딩 시간
- [ ] DOMContentLoaded < 2초
- [ ] 첫 콘텐츠 렌더링 < 1초
- [ ] 콘솔에서 `showPerformanceReport()` 실행 후 확인

#### 3.2 API 캐싱
- [ ] 첫 API 호출: 정상 응답 (300-500ms)
- [ ] 두 번째 API 호출 (1분 내): 메모리 캐시 히트 (<1ms)
- [ ] 세 번째 API 호출 (5분 내): localStorage 캐시 히트 (<10ms)
- [ ] 콘솔에서 `window.cacheManager.getStats()` 실행 후 확인

#### 3.3 이미지 Lazy Loading
- [ ] 페이지 로딩 시 화면에 보이는 이미지만 로드
- [ ] 스크롤 시 추가 이미지 로드
- [ ] Network 탭에서 확인 (크롬 개발자 도구)

#### 3.4 Carousel 애니메이션
- [ ] 스와이프 애니메이션 부드러움 (60fps)
- [ ] 버튼 클릭 애니메이션 부드러움
- [ ] Performance 탭에서 확인 (크롬 개발자 도구)

---

### 4. 브라우저 호환성 테스트

#### 4.1 데스크톱 브라우저
- [ ] **Chrome (최신)**
  - [ ] 모든 기능 정상 작동
  - [ ] 레이아웃 정상
  - [ ] 애니메이션 정상
- [ ] **Safari (최신)**
  - [ ] 모든 기능 정상 작동
  - [ ] 레이아웃 정상
  - [ ] 애니메이션 정상
- [ ] **Firefox (최신)**
  - [ ] 모든 기능 정상 작동
  - [ ] 레이아웃 정상
  - [ ] 애니메이션 정상
- [ ] **Edge (최신)**
  - [ ] 모든 기능 정상 작동
  - [ ] 레이아웃 정상
  - [ ] 애니메이션 정상

#### 4.2 모바일 브라우저
- [ ] **iOS Safari**
  - [ ] 터치 스와이프 정상 작동
  - [ ] 반응형 디자인 정상
  - [ ] 레이아웃 정상
- [ ] **Android Chrome**
  - [ ] 터치 스와이프 정상 작동
  - [ ] 반응형 디자인 정상
  - [ ] 레이아웃 정상

---

### 5. 에러 핸들링 테스트

#### 5.1 네트워크 에러
- [ ] 백엔드 서버 다운 시 에러 메시지 표시
- [ ] 네트워크 연결 끊김 시 에러 메시지 표시
- [ ] 타임아웃 시 에러 메시지 표시

#### 5.2 데이터 없음
- [ ] POW 기록 없는 경우 빈 상태 표시
- [ ] 기부 기록 없는 경우 빈 상태 표시
- [ ] 인기 기록 없는 경우 빈 상태 표시
- [ ] 필터링 결과 없는 경우 메시지 표시

#### 5.3 로그인 상태
- [ ] 비로그인 상태에서 개인 데이터 접근 시 로그인 안내
- [ ] 세션 만료 시 로그인 안내

---

### 6. 보안 검토

#### 6.1 XSS 방지
- [ ] 사용자 입력값 HTML 이스케이프 처리
- [ ] innerHTML 사용 시 안전한 값만 삽입
- [ ] textContent 우선 사용

#### 6.2 민감 정보 보호
- [ ] API 키 노출 없음
- [ ] 사용자 개인정보 콘솔 로그 없음
- [ ] localStorage에 민감 정보 저장 없음

#### 6.3 CORS
- [ ] 백엔드 API CORS 설정 확인
- [ ] 프로덕션 도메인 화이트리스트 등록

---

### 7. 접근성 테스트

#### 7.1 키보드 네비게이션
- [ ] Tab 키로 모든 인터랙티브 요소 접근 가능
- [ ] Enter/Space로 버튼 활성화
- [ ] 화살표 키로 Carousel 네비게이션
- [ ] Esc 키로 모달 닫기 (해당 시)

#### 7.2 스크린 리더
- [ ] alt 속성 모든 이미지에 추가
- [ ] aria-label 필요한 곳에 추가
- [ ] 시맨틱 HTML 사용 (nav, main, header)

---

### 8. 배포 환경 설정

#### 8.1 백엔드 URL 확인
- [ ] config.js에서 프로덕션 URL 확인
  ```javascript
  production: 'https://citadel-pow-backend.magadenuevo2025.workers.dev'
  ```
- [ ] 백엔드 API 정상 작동 확인

#### 8.2 프론트엔드 배포
- [ ] GitHub Pages 또는 Cloudflare Pages 설정
- [ ] 커스텀 도메인 설정 (선택)
- [ ] HTTPS 활성화

#### 8.3 환경 변수
- [ ] 프로덕션 환경 변수 설정
- [ ] 개발 환경과 프로덕션 환경 구분

---

### 9. 문서화

- [x] INTEGRATION_TEST_CHECKLIST.md
- [x] INTEGRATION_TEST_SUMMARY.md
- [ ] DEPLOYMENT_CHECKLIST.md (현재 파일)
- [ ] DEPLOYMENT_GUIDE.md
- [ ] README.md 업데이트

---

### 10. Git 및 버전 관리

- [x] 모든 변경사항 커밋
- [x] GitHub에 푸시
- [ ] Git 태그 생성 (v2.0.0)
- [ ] Release Notes 작성

---

## 🚨 배포 전 필수 확인 사항

### Critical (반드시 확인)
1. [ ] 백엔드 API 3개 엔드포인트 정상 작동
   - `/api/discord-posts/popular`
   - `/api/rankings/by-category`
   - `/api/donations/top?category=`
2. [ ] 프로덕션 백엔드 URL 정확함
3. [ ] 모든 페이지 네비게이션 정상 작동
4. [ ] 주요 기능 (대시보드, 인기 기록, 나의 POW 기록, 기부 기록) 정상 작동

### Warning (권장 확인)
1. [ ] 성능 테스트 완료 (페이지 로딩 < 2초)
2. [ ] 캐싱 정상 작동 확인
3. [ ] 이미지 lazy loading 작동 확인
4. [ ] 모바일 테스트 완료

---

## 📝 배포 후 모니터링

### 첫 24시간
- [ ] 에러 로그 확인
- [ ] 성능 메트릭 확인 (페이지 로딩 시간, API 응답 시간)
- [ ] 사용자 피드백 수집

### 첫 1주일
- [ ] 캐시 히트율 확인
- [ ] 이미지 로딩 최적화 효과 확인
- [ ] 사용자 행동 분석 (어떤 기능을 많이 사용하는지)

---

## 🎉 배포 완료 후

- [ ] 팀/커뮤니티에 공지
- [ ] Release Notes 배포
- [ ] 사용자 가이드 업데이트
- [ ] 프로젝트 회고 작성

---

**작성일**: 2026-01-10
**작성자**: Claude Code
**Phase**: 6-3 - 최종 배포 준비
**상태**: ✅ 준비 완료
