// Citadel POW Filter 컴포넌트
// Phase 2: 재사용 가능한 필터 UI 및 이벤트 처리

/**
 * Filter 컴포넌트
 * 분야(category), 날짜(date), 기간(period) 필터링 UI 관리
 */
class Filter {
  /**
   * @param {Object} options - Filter 옵션
   * @param {HTMLElement} options.categorySelect - 분야 선택 <select> 요소 (선택)
   * @param {HTMLElement} options.dateInput - 날짜 선택 <input type="date"> 요소 (선택)
   * @param {NodeList} options.periodButtons - 기간 버튼들 (선택)
   * @param {Function} options.onChange - 필터 변경 시 콜백 함수
   * @param {Object} options.initialValues - 초기값 { category, date, period }
   */
  constructor(options) {
    this.categorySelect = options.categorySelect;
    this.dateInput = options.dateInput;
    this.periodButtons = options.periodButtons || [];
    this.onChange = options.onChange || (() => {});

    this.filters = {
      category: options.initialValues?.category || 'all',
      date: options.initialValues?.date || null,
      period: options.initialValues?.period || null,
    };

    this.init();
  }

  /**
   * Filter 초기화
   */
  init() {
    // 카테고리 선택 이벤트
    if (this.categorySelect) {
      this.categorySelect.value = this.filters.category;
      this.categorySelect.addEventListener('change', (e) => {
        this.setCategory(e.target.value);
      });
    }

    // 날짜 선택 이벤트
    if (this.dateInput) {
      if (this.filters.date) {
        this.dateInput.value = this.filters.date;
      }
      this.dateInput.addEventListener('change', (e) => {
        this.setDate(e.target.value);
      });
    }

    // 기간 버튼 이벤트
    if (this.periodButtons.length > 0) {
      this.periodButtons.forEach(button => {
        const period = button.dataset.period;
        if (period === this.filters.period) {
          button.classList.add('active');
        }

        button.addEventListener('click', () => {
          this.setPeriod(period);
        });
      });
    }
  }

  /**
   * 카테고리 변경
   * @param {string} category - 카테고리 값
   */
  setCategory(category) {
    this.filters.category = category;
    this.triggerChange();
  }

  /**
   * 날짜 변경
   * @param {string} date - 날짜 (YYYY-MM-DD)
   */
  setDate(date) {
    this.filters.date = date || null;

    // 날짜 선택 시 period 초기화
    if (date) {
      this.clearPeriod();
    }

    this.triggerChange();
  }

  /**
   * 기간 변경
   * @param {string} period - 기간 ('today' | 'week' | 'month')
   */
  setPeriod(period) {
    this.filters.period = period;

    // 기간 버튼 활성화 상태 변경
    if (this.periodButtons.length > 0) {
      this.periodButtons.forEach(button => {
        if (button.dataset.period === period) {
          button.classList.add('active');
        } else {
          button.classList.remove('active');
        }
      });
    }

    // period 선택 시 date 초기화
    if (this.dateInput) {
      this.dateInput.value = '';
      this.filters.date = null;
    }

    this.triggerChange();
  }

  /**
   * 기간 초기화
   */
  clearPeriod() {
    this.filters.period = null;

    // 기간 버튼 비활성화
    if (this.periodButtons.length > 0) {
      this.periodButtons.forEach(button => {
        button.classList.remove('active');
      });
    }
  }

  /**
   * 모든 필터 초기화
   */
  reset() {
    this.filters = {
      category: 'all',
      date: null,
      period: null,
    };

    if (this.categorySelect) {
      this.categorySelect.value = 'all';
    }

    if (this.dateInput) {
      this.dateInput.value = '';
    }

    this.clearPeriod();

    this.triggerChange();
  }

  /**
   * 현재 필터 값 가져오기
   * @returns {Object} { category, date, period }
   */
  getFilters() {
    return { ...this.filters };
  }

  /**
   * 특정 필터 값 가져오기
   * @param {string} key - 필터 키 ('category' | 'date' | 'period')
   * @returns {any} 필터 값
   */
  getFilter(key) {
    return this.filters[key];
  }

  /**
   * 필터 값 설정 (여러 개 한번에)
   * @param {Object} filters - { category, date, period }
   */
  setFilters(filters) {
    if (filters.category !== undefined) {
      this.setCategory(filters.category);
    }
    if (filters.date !== undefined) {
      this.setDate(filters.date);
    }
    if (filters.period !== undefined) {
      this.setPeriod(filters.period);
    }
  }

  /**
   * 필터 변경 이벤트 트리거
   */
  triggerChange() {
    this.onChange(this.getFilters());
  }

  /**
   * API 쿼리 문자열 생성
   * @returns {string} 쿼리 문자열 (예: "?category=pow-writing&period=week")
   */
  toQueryString() {
    const params = [];

    if (this.filters.category && this.filters.category !== 'all') {
      params.push(`category=${encodeURIComponent(this.filters.category)}`);
    }

    if (this.filters.date) {
      params.push(`date=${encodeURIComponent(this.filters.date)}`);
    }

    if (this.filters.period) {
      params.push(`period=${encodeURIComponent(this.filters.period)}`);
    }

    return params.length > 0 ? `?${params.join('&')}` : '';
  }

  /**
   * localStorage에서 필터 복원
   * @param {string} key - localStorage 키
   */
  loadFromStorage(key) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const filters = JSON.parse(saved);
        this.setFilters(filters);
      }
    } catch (error) {
      console.error('필터 복원 실패:', error);
    }
  }

  /**
   * localStorage에 필터 저장
   * @param {string} key - localStorage 키
   */
  saveToStorage(key) {
    try {
      localStorage.setItem(key, JSON.stringify(this.filters));
    } catch (error) {
      console.error('필터 저장 실패:', error);
    }
  }
}
