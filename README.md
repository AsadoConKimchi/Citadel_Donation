# Citadel POW (Proof of Work)

**버전**: 2.0.0
**마지막 업데이트**: 2026-01-10

Discord 로그인, POW 타이머, 인증 카드, 사토시 기부를 한 번에 경험할 수 있는 웹 애플리케이션입니다.

**v2.0.0 주요 변경사항**:
- 🎨 UI 대규모 개편 (3개 탭 → 4개 탭)
- 🧩 재사용 가능한 컴포넌트 시스템
- ⚡ 성능 최적화 (API 캐싱, 이미지 lazy loading)
- 📊 성능 측정 도구 추가

---

## 📋 목차

- [주요 기능](#주요-기능)
- [프로젝트 구조](#프로젝트-구조)
- [설치 및 실행](#설치-및-실행)
- [배포](#배포)
- [성능 최적화](#성능-최적화)
- [개발자 가이드](#개발자-가이드)
- [문서](#문서)
- [기여](#기여)

---

## 주요 기능

### 🏠 오늘 (index.html)
- Discord OAuth 로그인 (App/Web)
- POW 분야 선택 (글쓰기, 음악, 공부, 그림, 독서, 봉사)
- POW 타이머 (목표 시간 설정, 누적 시간 추적)
- 인증 카드 생성 (카메라 촬영 또는 업로드)
- 사토시 기부 (즉시 기부 / 적립 후 기부)
- 오늘 기부 현황 요약

### 📊 Citadel POW (study-history.html)
**대시보드**:
- POW 시간 / 기부 금액 기준 TOP 10 리더보드
- 전체 / 분야별 필터링

**인기 기록**:
- Discord 반응 수 기준 Top 5 인증카드
- 스와이프 Carousel (모바일 터치, 데스크톱 키보드 지원)
- 분야별 필터링

### 📝 나의 POW 기록 (my-pow-records.html)
- 분야 / 날짜 / 기간(오늘/이번주/이번달) 필터
- 총 POW 시간 및 세션 수 통계
- 인증카드 Carousel (이미지 또는 텍스트 카드)
- 최신순 정렬

### 💰 기부 기록 (donation-history.html)
**나의 기부 현황**:
- 누적 기부액
- 현재 적립액 (적립 후 기부 모드)
- 적립액 즉시 기부 기능

**Top 5 대시보드**:
- 전체 / 분야별 최고 기부자 TOP 5

**나의 기부 기록**:
- 월별 + 분야별 필터링
- 기부 내역 리스트 (날짜, 금액, 분야)

---

## 프로젝트 구조

```
Citadel_POW/
├── index.html                      # 오늘 탭
├── study-history.html              # Citadel POW 탭
├── my-pow-records.html             # 나의 POW 기록 탭
├── donation-history.html           # 기부 기록 탭
│
├── config.js                       # 백엔드 URL 설정
├── common.js                       # 공통 유틸리티 (날짜, 카테고리 등)
├── api.js                          # API 통신 래퍼
├── cache-manager.js                # API 캐싱 시스템 (메모리 + localStorage)
├── performance-monitor.js          # 성능 측정 도구
│
├── app.js                          # 오늘 탭 로직
├── study-history-app.js            # Citadel POW 탭 로직
├── my-pow-records-app.js           # 나의 POW 기록 탭 로직
├── donation-history-app.js         # 기부 기록 탭 로직
│
├── components/
│   ├── carousel.js                 # 스와이프 Carousel 컴포넌트
│   ├── leaderboard.js              # 리더보드 컴포넌트
│   ├── filter.js                   # 필터 컴포넌트
│   └── tab-switcher.js             # 탭 전환 컴포넌트
│
├── styles.css                      # 공통 스타일
│
├── docs/
│   ├── INTEGRATION_TEST_CHECKLIST.md    # 통합 테스트 체크리스트
│   ├── INTEGRATION_TEST_SUMMARY.md      # 통합 테스트 요약
│   ├── DEPLOYMENT_CHECKLIST.md          # 배포 전 체크리스트
│   └── DEPLOYMENT_GUIDE.md              # 배포 가이드
│
└── README.md                       # 프로젝트 문서 (현재 파일)
```

### 컴포넌트 의존성

```
config.js (백엔드 URL)
  ↓
performance-monitor.js (성능 측정)
  ↓
cache-manager.js (API 캐싱)
  ↓
common.js (공통 유틸리티)
  ↓
api.js (API 통신)
  ↓
components/* (재사용 컴포넌트)
  ↓
*-app.js (페이지별 로직)
```

---

## 설치 및 실행

### 사전 요구사항

- Node.js 16+ (Discord OAuth 서버용)
- 백엔드 API (Cloudflare Workers)
- Supabase 데이터베이스

### 1. 저장소 클론

```bash
git clone https://github.com/AsadoConKimchi/Citadel_POW.git
cd Citadel_POW
```

### 2. 환경 변수 설정

`.env.example`을 복사하여 `.env` 생성:

```bash
cp .env.example .env
```

`.env` 파일 편집:
```env
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback
DISCORD_GUILD_ID=your_guild_id
DISCORD_GUILD_NAME=your_guild_name
DISCORD_ROLE_ID=your_role_id
SESSION_SECRET=your_random_secret
```

### 3. Discord OAuth 서버 실행

```bash
npm install
npm start
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 4. 백엔드 API 설정

`config.js`에서 백엔드 URL 확인:

```javascript
const BACKEND_CONFIG = {
  development: 'http://localhost:8787',
  production: 'https://citadel-pow-backend.magadenuevo2025.workers.dev',
};
```

### 5. 브라우저에서 접속

```
http://localhost:3000/index.html
```

---

## 배포

### GitHub Pages

1. GitHub 저장소 > **Settings** > **Pages**
2. **Source**: `main` 브랜치 선택
3. **Folder**: `/ (root)` 선택
4. **Save** 클릭
5. 배포 URL: `https://asadoconkimchi.github.io/Citadel_POW/`

### Cloudflare Pages

1. Cloudflare Dashboard > **Pages** > **Create a project**
2. GitHub 저장소 연결: `AsadoConKimchi/Citadel_POW`
3. **Framework preset**: None
4. **Build output directory**: `/`
5. 배포 URL: `https://citadel-pow.pages.dev/`

### 상세 배포 가이드

[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) 참조

---

## 성능 최적화

### API 캐싱 (cache-manager.js)

**이중 캐싱 시스템**:
- **메모리 캐시**: 1분 (초고속)
- **localStorage 캐시**: 5분 (페이지 새로고침 후에도 유지)

**사용 예시**:
```javascript
// 자동 캐싱
const data = await cachedFetch(endpoint, {}, { useCache: true, params });

// 캐시 통계 확인 (콘솔)
window.cacheManager.getStats()

// 캐시 삭제
window.cacheManager.clear()
```

### 이미지 Lazy Loading

모든 이미지에 `loading="lazy"` 속성 적용:
- 화면에 보이지 않는 이미지는 로드하지 않음
- 스크롤 시 필요할 때만 로드
- **페이지 로딩 속도 30-50% 향상**

### 성능 측정 도구 (performance-monitor.js)

**자동 측정 항목**:
- 페이지 로딩 시간 (DOMContentLoaded, Load)
- API 응답 시간
- Web Vitals (LCP, FID, CLS)
- 에러 추적

**사용 예시**:
```javascript
// 성능 리포트 확인 (콘솔)
showPerformanceReport()

// 출력 예시:
// 📊 Performance Report
// 페이지 로딩: { domContentLoaded: 1523ms, ... }
// API 호출: { total: 5, successful: 5, avgDuration: 234ms }
// 캐시: { memory: { count: 3 }, storage: { size: "12.34 KB" } }
```

---

## 개발자 가이드

### 새로운 컴포넌트 추가

1. `components/` 디렉토리에 파일 생성
2. 클래스 기반 컴포넌트 작성
3. HTML에서 임포트 및 초기화

**예시**:
```javascript
// components/my-component.js
class MyComponent {
  constructor(options) {
    this.container = options.container;
    this.init();
  }

  init() {
    // 초기화 로직
  }

  render() {
    // 렌더링 로직
  }
}
```

### API 호출 시 캐싱 적용

```javascript
// 캐싱 없음 (기존 방식)
const response = await fetch(endpoint);
const data = await response.json();

// 캐싱 적용 (새로운 방식)
const data = await cachedFetch(endpoint, {}, {
  useCache: true,
  params: { category: 'all', limit: 10 }
});
```

### 성능 측정 추가

```javascript
// API 호출 시 자동 측정 (cachedFetch 사용 시)
// 수동 측정이 필요한 경우:
const timerId = window.performanceMonitor.startApiTimer('/custom/endpoint');
try {
  // 작업 수행
  window.performanceMonitor.endApiTimer(timerId, true);
} catch (error) {
  window.performanceMonitor.endApiTimer(timerId, false);
}
```

---

## 문서

- [INTEGRATION_TEST_CHECKLIST.md](INTEGRATION_TEST_CHECKLIST.md) - 통합 테스트 체크리스트
- [INTEGRATION_TEST_SUMMARY.md](INTEGRATION_TEST_SUMMARY.md) - 통합 테스트 요약
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - 배포 전 체크리스트
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - 배포 가이드

---

## 백엔드 API

백엔드 저장소: [Citadel_POW_BackEND](https://github.com/AsadoConKimchi/Citadel_POW_BackEND)

### 신규 API 엔드포인트 (v2.0.0)

1. **인기 POW 조회**:
   ```
   GET /api/discord-posts/popular?category={category}&limit=5
   ```

2. **분야별 랭킹**:
   ```
   GET /api/rankings/by-category?type={time|donation}&category={category}&limit=10
   ```

3. **분야별 Top 기부자**:
   ```
   GET /api/donations/top?category={category}&limit=5
   ```

---

## 브라우저 지원

- Chrome (최신)
- Safari (최신)
- Firefox (최신)
- Edge (최신)
- Mobile Safari (iOS)
- Mobile Chrome (Android)

---

## 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 라이선스

MIT License

---

## 개발팀

- **프론트엔드 개편**: Claude Code (Anthropic)
- **백엔드 API**: Cloudflare Workers + Supabase
- **Discord OAuth**: Node.js + Express

---

## 버전 히스토리

### v2.0.0 (2026-01-10)
- 🎨 UI 대규모 개편 (4개 탭)
- 🧩 컴포넌트 시스템 (Carousel, Leaderboard, Filter, TabSwitcher)
- ⚡ 성능 최적화 (API 캐싱, 이미지 lazy loading)
- 📊 성능 측정 도구 추가
- 📚 문서화 완료

### v1.0.0 (초기 버전)
- Discord OAuth 로그인
- POW 타이머
- 인증 카드 생성
- 사토시 기부

---

**Live Demo**: https://asadoconkimchi.github.io/Citadel_POW/
**Backend API**: https://citadel-pow-backend.magadenuevo2025.workers.dev
**GitHub**: https://github.com/AsadoConKimchi/Citadel_POW
