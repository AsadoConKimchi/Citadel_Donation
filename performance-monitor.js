// Citadel POW Performance Monitor
// Phase 6-2: 성능 측정 및 개선

/**
 * PerformanceMonitor 클래스
 * 페이지 로딩 시간, API 응답 시간 등을 측정하고 보고
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoad: {},
      apiCalls: [],
      errors: [],
    };

    this.debug = false;
    this.init();
  }

  /**
   * 초기화
   */
  init() {
    // 페이지 로딩 시간 측정
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.measurePageLoad();
      });
    } else {
      this.measurePageLoad();
    }

    window.addEventListener('load', () => {
      this.measureFullLoad();
    });

    // 에러 추적
    window.addEventListener('error', (event) => {
      this.trackError(event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(event.reason);
    });
  }

  /**
   * 페이지 로딩 시간 측정 (DOMContentLoaded)
   */
  measurePageLoad() {
    if (!window.performance || !window.performance.timing) return;

    const timing = window.performance.timing;
    const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
    const domInteractive = timing.domInteractive - timing.navigationStart;

    this.metrics.pageLoad.domContentLoaded = domContentLoaded;
    this.metrics.pageLoad.domInteractive = domInteractive;

    if (this.debug) {
      console.log(`[Performance] DOM Content Loaded: ${domContentLoaded}ms`);
      console.log(`[Performance] DOM Interactive: ${domInteractive}ms`);
    }

    // 2초 이상이면 경고
    if (domContentLoaded > 2000) {
      console.warn(`[Performance] 페이지 로딩 느림: ${domContentLoaded}ms (목표: < 2000ms)`);
    }
  }

  /**
   * 전체 페이지 로딩 시간 측정 (Load)
   */
  measureFullLoad() {
    if (!window.performance || !window.performance.timing) return;

    const timing = window.performance.timing;
    const fullLoad = timing.loadEventEnd - timing.navigationStart;

    this.metrics.pageLoad.fullLoad = fullLoad;

    if (this.debug) {
      console.log(`[Performance] Full Load: ${fullLoad}ms`);
    }
  }

  /**
   * API 호출 시간 측정 시작
   * @param {string} endpoint - API 엔드포인트
   * @returns {string} 타이머 ID
   */
  startApiTimer(endpoint) {
    const timerId = `api_${Date.now()}_${Math.random()}`;
    const startTime = performance.now();

    this.metrics.apiCalls.push({
      id: timerId,
      endpoint,
      startTime,
      endTime: null,
      duration: null,
    });

    return timerId;
  }

  /**
   * API 호출 시간 측정 종료
   * @param {string} timerId - 타이머 ID
   * @param {boolean} success - 성공 여부
   */
  endApiTimer(timerId, success = true) {
    const apiCall = this.metrics.apiCalls.find(call => call.id === timerId);
    if (!apiCall) return;

    apiCall.endTime = performance.now();
    apiCall.duration = apiCall.endTime - apiCall.startTime;
    apiCall.success = success;

    if (this.debug) {
      console.log(`[Performance] API ${apiCall.endpoint}: ${apiCall.duration.toFixed(2)}ms`);
    }

    // 500ms 이상이면 경고
    if (apiCall.duration > 500) {
      console.warn(`[Performance] API 응답 느림: ${apiCall.endpoint} - ${apiCall.duration.toFixed(2)}ms (목표: < 500ms)`);
    }
  }

  /**
   * 에러 추적
   * @param {Error} error - 에러 객체
   */
  trackError(error) {
    this.metrics.errors.push({
      message: error.message || String(error),
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    console.error('[Performance] Error tracked:', error);
  }

  /**
   * 성능 리포트 조회
   * @returns {Object} 성능 메트릭
   */
  getReport() {
    const apiCallsSuccessful = this.metrics.apiCalls.filter(call => call.success && call.duration !== null);
    const apiCallsFailed = this.metrics.apiCalls.filter(call => !call.success);

    const avgApiDuration = apiCallsSuccessful.length > 0
      ? apiCallsSuccessful.reduce((sum, call) => sum + call.duration, 0) / apiCallsSuccessful.length
      : 0;

    const slowApiCalls = apiCallsSuccessful.filter(call => call.duration > 500);

    return {
      pageLoad: {
        domContentLoaded: this.metrics.pageLoad.domContentLoaded || 'N/A',
        domInteractive: this.metrics.pageLoad.domInteractive || 'N/A',
        fullLoad: this.metrics.pageLoad.fullLoad || 'N/A',
      },
      apiCalls: {
        total: this.metrics.apiCalls.length,
        successful: apiCallsSuccessful.length,
        failed: apiCallsFailed.length,
        avgDuration: `${avgApiDuration.toFixed(2)}ms`,
        slowCalls: slowApiCalls.length,
      },
      errors: {
        total: this.metrics.errors.length,
        recent: this.metrics.errors.slice(-5),
      },
      cacheStats: window.cacheManager ? window.cacheManager.getStats() : null,
    };
  }

  /**
   * 성능 리포트 콘솔 출력
   */
  printReport() {
    const report = this.getReport();

    console.group('📊 Performance Report');
    console.log('페이지 로딩:', report.pageLoad);
    console.log('API 호출:', report.apiCalls);
    console.log('에러:', report.errors);
    if (report.cacheStats) {
      console.log('캐시:', report.cacheStats);
    }
    console.groupEnd();

    return report;
  }

  /**
   * 성능 리포트 초기화
   */
  reset() {
    this.metrics = {
      pageLoad: {},
      apiCalls: [],
      errors: [],
    };

    console.log('[Performance] 메트릭 초기화됨');
  }

  /**
   * 디버그 모드 토글
   * @param {boolean} enabled - 디버그 모드 활성화 여부
   */
  setDebug(enabled) {
    this.debug = enabled;
    console.log(`[Performance] 디버그 모드: ${enabled ? 'ON' : 'OFF'}`);
  }

  /**
   * Web Vitals 측정 (Chrome 전용)
   */
  measureWebVitals() {
    if (!window.performance || !window.PerformanceObserver) {
      console.warn('[Performance] Web Vitals 측정 불가 (브라우저 미지원)');
      return;
    }

    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log(`[Web Vitals] LCP: ${lastEntry.renderTime || lastEntry.loadTime}ms`);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          console.log(`[Web Vitals] FID: ${entry.processingStart - entry.startTime}ms`);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log(`[Web Vitals] CLS: ${clsValue}`);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.error('[Performance] Web Vitals 측정 실패:', error);
    }
  }
}

// 전역 PerformanceMonitor 인스턴스 생성
window.performanceMonitor = new PerformanceMonitor();

// 개발 환경에서 디버그 모드 활성화
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.performanceMonitor.setDebug(true);
  window.performanceMonitor.measureWebVitals();
}

// 전역 함수로 리포트 출력 (개발 도구에서 사용 가능)
window.showPerformanceReport = () => {
  return window.performanceMonitor.printReport();
};

console.log('📈 Performance Monitor 초기화 완료');
console.log('💡 Tip: 콘솔에서 `showPerformanceReport()` 실행 시 성능 리포트 확인');
