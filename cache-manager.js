// Citadel POW Cache Manager
// Phase 6-2: API 캐싱 전략 구현

/**
 * CacheManager 클래스
 * localStorage (5분) + 메모리 (1분) 이중 캐싱 전략
 */
class CacheManager {
  constructor() {
    // 메모리 캐시 (빠르지만 페이지 새로고침 시 사라짐)
    this.memoryCache = new Map();

    // 캐시 만료 시간 (밀리초)
    this.MEMORY_TTL = 60 * 1000;      // 1분
    this.STORAGE_TTL = 5 * 60 * 1000; // 5분

    // 디버그 모드
    this.debug = false;
  }

  /**
   * 캐시 키 생성
   * @param {string} endpoint - API 엔드포인트
   * @param {Object} params - 쿼리 파라미터
   * @returns {string} 캐시 키
   */
  generateKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return `cache:${endpoint}${sortedParams ? '?' + sortedParams : ''}`;
  }

  /**
   * 데이터 가져오기 (메모리 → localStorage → null)
   * @param {string} key - 캐시 키
   * @returns {any|null} 캐시된 데이터 또는 null
   */
  get(key) {
    const now = Date.now();

    // 1. 메모리 캐시 확인 (가장 빠름)
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && (now - memoryEntry.timestamp) < this.MEMORY_TTL) {
      if (this.debug) {
        console.log(`[Cache] 메모리 히트: ${key}`);
      }
      return memoryEntry.data;
    }

    // 2. localStorage 캐시 확인
    try {
      const storageEntry = localStorage.getItem(key);
      if (storageEntry) {
        const { data, timestamp } = JSON.parse(storageEntry);

        if ((now - timestamp) < this.STORAGE_TTL) {
          if (this.debug) {
            console.log(`[Cache] localStorage 히트: ${key}`);
          }

          // localStorage에서 가져온 데이터를 메모리에도 저장
          this.memoryCache.set(key, { data, timestamp: now });

          return data;
        } else {
          // 만료된 localStorage 캐시 삭제
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('[Cache] localStorage 읽기 실패:', error);
    }

    if (this.debug) {
      console.log(`[Cache] 미스: ${key}`);
    }

    return null;
  }

  /**
   * 데이터 저장 (메모리 + localStorage)
   * @param {string} key - 캐시 키
   * @param {any} data - 저장할 데이터
   */
  set(key, data) {
    const now = Date.now();

    // 1. 메모리 캐시 저장
    this.memoryCache.set(key, {
      data,
      timestamp: now,
    });

    // 2. localStorage 캐시 저장
    try {
      const entry = {
        data,
        timestamp: now,
      };
      localStorage.setItem(key, JSON.stringify(entry));

      if (this.debug) {
        console.log(`[Cache] 저장 완료: ${key}`);
      }
    } catch (error) {
      console.error('[Cache] localStorage 저장 실패:', error);

      // localStorage가 꽉 찼을 경우, 오래된 캐시 삭제
      if (error.name === 'QuotaExceededError') {
        this.clearOldEntries();

        // 재시도
        try {
          localStorage.setItem(key, JSON.stringify({ data, timestamp: now }));
        } catch (retryError) {
          console.error('[Cache] 재시도 실패:', retryError);
        }
      }
    }
  }

  /**
   * 특정 캐시 삭제
   * @param {string} key - 캐시 키
   */
  delete(key) {
    this.memoryCache.delete(key);

    try {
      localStorage.removeItem(key);
      if (this.debug) {
        console.log(`[Cache] 삭제 완료: ${key}`);
      }
    } catch (error) {
      console.error('[Cache] 삭제 실패:', error);
    }
  }

  /**
   * 패턴과 일치하는 모든 캐시 삭제
   * @param {string} pattern - 검색 패턴 (예: "cache:/api/donations")
   */
  deletePattern(pattern) {
    // 메모리 캐시에서 삭제
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }

    // localStorage에서 삭제
    try {
      const keysToDelete = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(pattern)) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => localStorage.removeItem(key));

      if (this.debug) {
        console.log(`[Cache] 패턴 삭제 완료: ${pattern} (${keysToDelete.length}개)`);
      }
    } catch (error) {
      console.error('[Cache] 패턴 삭제 실패:', error);
    }
  }

  /**
   * 모든 캐시 삭제
   */
  clear() {
    this.memoryCache.clear();

    try {
      const keysToDelete = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache:')) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => localStorage.removeItem(key));

      if (this.debug) {
        console.log(`[Cache] 전체 삭제 완료 (${keysToDelete.length}개)`);
      }
    } catch (error) {
      console.error('[Cache] 전체 삭제 실패:', error);
    }
  }

  /**
   * 오래된 캐시 항목 삭제 (localStorage 용량 확보)
   */
  clearOldEntries() {
    const now = Date.now();
    const keysToDelete = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache:')) {
          try {
            const { timestamp } = JSON.parse(localStorage.getItem(key));
            if ((now - timestamp) > this.STORAGE_TTL) {
              keysToDelete.push(key);
            }
          } catch (parseError) {
            // 파싱 실패한 항목도 삭제
            keysToDelete.push(key);
          }
        }
      }

      keysToDelete.forEach(key => localStorage.removeItem(key));

      console.log(`[Cache] 오래된 항목 ${keysToDelete.length}개 삭제됨`);
    } catch (error) {
      console.error('[Cache] 오래된 항목 삭제 실패:', error);
    }
  }

  /**
   * 캐시 통계 조회
   * @returns {Object} 캐시 통계
   */
  getStats() {
    const memoryCount = this.memoryCache.size;
    let storageCount = 0;
    let storageSize = 0;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache:')) {
          storageCount++;
          const value = localStorage.getItem(key);
          storageSize += (key.length + value.length) * 2; // UTF-16 = 2 bytes per char
        }
      }
    } catch (error) {
      console.error('[Cache] 통계 조회 실패:', error);
    }

    return {
      memory: {
        count: memoryCount,
        ttl: `${this.MEMORY_TTL / 1000}초`,
      },
      storage: {
        count: storageCount,
        size: `${(storageSize / 1024).toFixed(2)} KB`,
        ttl: `${this.STORAGE_TTL / 1000}초`,
      },
    };
  }

  /**
   * 디버그 모드 토글
   * @param {boolean} enabled - 디버그 모드 활성화 여부
   */
  setDebug(enabled) {
    this.debug = enabled;
    console.log(`[Cache] 디버그 모드: ${enabled ? 'ON' : 'OFF'}`);
  }
}

/**
 * API 캐싱을 지원하는 fetch 래퍼
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - fetch 옵션
 * @param {Object} cacheOptions - 캐싱 옵션
 * @returns {Promise<any>} API 응답
 */
async function cachedFetch(endpoint, options = {}, cacheOptions = {}) {
  const {
    useCache = true,
    params = {},
    invalidate = false,
  } = cacheOptions;

  const cacheKey = window.cacheManager.generateKey(endpoint, params);

  // 캐시 무효화 요청 시 캐시 삭제
  if (invalidate) {
    window.cacheManager.delete(cacheKey);
  }

  // 캐시 사용하지 않는 경우 바로 fetch
  if (!useCache) {
    const timerId = window.performanceMonitor?.startApiTimer(endpoint);
    try {
      const response = await fetch(endpoint, options);
      const data = await response.json();
      window.performanceMonitor?.endApiTimer(timerId, response.ok);
      return data;
    } catch (error) {
      window.performanceMonitor?.endApiTimer(timerId, false);
      throw error;
    }
  }

  // 캐시 확인
  const cached = window.cacheManager.get(cacheKey);
  if (cached) {
    return cached;
  }

  // API 호출 (성능 측정 포함)
  const timerId = window.performanceMonitor?.startApiTimer(endpoint);
  try {
    const response = await fetch(endpoint, options);
    const data = await response.json();

    // 성공한 응답만 캐싱
    if (response.ok && data.success !== false) {
      window.cacheManager.set(cacheKey, data);
    }

    window.performanceMonitor?.endApiTimer(timerId, response.ok);
    return data;
  } catch (error) {
    window.performanceMonitor?.endApiTimer(timerId, false);
    throw error;
  }
}

// 전역 CacheManager 인스턴스 생성
window.cacheManager = new CacheManager();

// 개발 환경에서 디버그 모드 활성화
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.cacheManager.setDebug(true);
}

// 페이지 언로드 시 메모리 캐시 정리 (선택적)
window.addEventListener('beforeunload', () => {
  // 메모리 캐시는 자동으로 사라지므로 특별한 처리 불필요
  // localStorage 캐시는 유지
});

console.log('📦 Cache Manager 초기화 완료');
console.log('📊 현재 캐시 통계:', window.cacheManager.getStats());
