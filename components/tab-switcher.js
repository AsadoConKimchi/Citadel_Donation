// Citadel POW TabSwitcher 컴포넌트
// Phase 2: 재사용 가능한 탭 전환 로직

/**
 * TabSwitcher 컴포넌트
 * 탭 버튼과 탭 컨텐츠 간의 전환을 관리
 */
class TabSwitcher {
  /**
   * @param {Object} options - TabSwitcher 옵션
   * @param {NodeList|Array} options.tabButtons - 탭 버튼들
   * @param {NodeList|Array} options.tabContents - 탭 컨텐츠들
   * @param {string} options.initialTab - 초기 활성화 탭 (data-tab 값)
   * @param {Function} options.onTabChange - 탭 변경 시 콜백 함수
   * @param {string} options.storageKey - localStorage에 현재 탭 저장 키 (선택)
   */
  constructor(options) {
    this.tabButtons = Array.from(options.tabButtons || []);
    this.tabContents = Array.from(options.tabContents || []);
    this.currentTab = options.initialTab || null;
    this.onTabChange = options.onTabChange || (() => {});
    this.storageKey = options.storageKey;

    this.init();
  }

  /**
   * TabSwitcher 초기화
   */
  init() {
    // localStorage에서 저장된 탭 복원
    if (this.storageKey) {
      const savedTab = localStorage.getItem(this.storageKey);
      if (savedTab) {
        this.currentTab = savedTab;
      }
    }

    // 초기 탭이 없으면 첫 번째 탭 활성화
    if (!this.currentTab && this.tabButtons.length > 0) {
      const firstTab = this.tabButtons[0].dataset.tab;
      if (firstTab) {
        this.currentTab = firstTab;
      }
    }

    // 탭 버튼 이벤트 리스너
    this.tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        if (tabName) {
          this.switchTo(tabName);
        }
      });
    });

    // 초기 탭 표시
    if (this.currentTab) {
      this.switchTo(this.currentTab);
    }
  }

  /**
   * 탭 전환
   * @param {string} tabName - 전환할 탭 이름 (data-tab 값)
   */
  switchTo(tabName) {
    this.currentTab = tabName;

    // 탭 버튼 활성화 상태 변경
    this.tabButtons.forEach(button => {
      if (button.dataset.tab === tabName) {
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');
      } else {
        button.classList.remove('active');
        button.setAttribute('aria-selected', 'false');
      }
    });

    // 탭 컨텐츠 표시/숨김
    this.tabContents.forEach(content => {
      if (content.dataset.tab === tabName || content.id === tabName) {
        content.classList.remove('hidden');
        content.classList.add('active');
        content.setAttribute('aria-hidden', 'false');
      } else {
        content.classList.add('hidden');
        content.classList.remove('active');
        content.setAttribute('aria-hidden', 'true');
      }
    });

    // localStorage에 저장
    if (this.storageKey) {
      localStorage.setItem(this.storageKey, tabName);
    }

    // 콜백 호출
    this.onTabChange(tabName);
  }

  /**
   * 현재 활성화된 탭 가져오기
   * @returns {string} 현재 탭 이름
   */
  getCurrentTab() {
    return this.currentTab;
  }

  /**
   * 특정 탭 비활성화/활성화
   * @param {string} tabName - 탭 이름
   * @param {boolean} disabled - 비활성화 여부
   */
  setTabDisabled(tabName, disabled) {
    this.tabButtons.forEach(button => {
      if (button.dataset.tab === tabName) {
        button.disabled = disabled;
      }
    });
  }

  /**
   * 특정 탭 숨기기/표시
   * @param {string} tabName - 탭 이름
   * @param {boolean} hidden - 숨김 여부
   */
  setTabHidden(tabName, hidden) {
    this.tabButtons.forEach(button => {
      if (button.dataset.tab === tabName) {
        if (hidden) {
          button.classList.add('hidden');
        } else {
          button.classList.remove('hidden');
        }
      }
    });
  }

  /**
   * 탭 개수 가져오기
   * @returns {number} 탭 개수
   */
  getTabCount() {
    return this.tabButtons.length;
  }

  /**
   * 모든 탭 이름 가져오기
   * @returns {Array<string>} 탭 이름 배열
   */
  getTabNames() {
    return this.tabButtons.map(button => button.dataset.tab).filter(Boolean);
  }

  /**
   * 다음 탭으로 전환
   */
  next() {
    const tabs = this.getTabNames();
    const currentIndex = tabs.indexOf(this.currentTab);

    if (currentIndex < tabs.length - 1) {
      this.switchTo(tabs[currentIndex + 1]);
    }
  }

  /**
   * 이전 탭으로 전환
   */
  prev() {
    const tabs = this.getTabNames();
    const currentIndex = tabs.indexOf(this.currentTab);

    if (currentIndex > 0) {
      this.switchTo(tabs[currentIndex - 1]);
    }
  }
}

/**
 * 토글 버튼 컴포넌트
 * 두 개의 상태를 토글하는 버튼 그룹 관리
 */
class ToggleButtons {
  /**
   * @param {Object} options - ToggleButtons 옵션
   * @param {NodeList|Array} options.buttons - 토글 버튼들
   * @param {Function} options.onChange - 값 변경 시 콜백 함수
   * @param {string} options.initialValue - 초기 선택 값
   * @param {string} options.storageKey - localStorage 저장 키 (선택)
   */
  constructor(options) {
    this.buttons = Array.from(options.buttons || []);
    this.onChange = options.onChange || (() => {});
    this.currentValue = options.initialValue || null;
    this.storageKey = options.storageKey;

    this.init();
  }

  /**
   * ToggleButtons 초기화
   */
  init() {
    // localStorage에서 저장된 값 복원
    if (this.storageKey) {
      const savedValue = localStorage.getItem(this.storageKey);
      if (savedValue) {
        this.currentValue = savedValue;
      }
    }

    // 초기값이 없으면 첫 번째 버튼 활성화
    if (!this.currentValue && this.buttons.length > 0) {
      const firstValue = this.buttons[0].dataset.value;
      if (firstValue) {
        this.currentValue = firstValue;
      }
    }

    // 버튼 이벤트 리스너
    this.buttons.forEach(button => {
      button.addEventListener('click', () => {
        const value = button.dataset.value;
        if (value) {
          this.setValue(value);
        }
      });
    });

    // 초기값 설정
    if (this.currentValue) {
      this.setValue(this.currentValue);
    }
  }

  /**
   * 값 설정
   * @param {string} value - 선택할 값
   */
  setValue(value) {
    this.currentValue = value;

    // 버튼 활성화 상태 변경
    this.buttons.forEach(button => {
      if (button.dataset.value === value) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });

    // localStorage에 저장
    if (this.storageKey) {
      localStorage.setItem(this.storageKey, value);
    }

    // 콜백 호출
    this.onChange(value);
  }

  /**
   * 현재 값 가져오기
   * @returns {string} 현재 값
   */
  getValue() {
    return this.currentValue;
  }

  /**
   * 모든 값 가져오기
   * @returns {Array<string>} 값 배열
   */
  getValues() {
    return this.buttons.map(button => button.dataset.value).filter(Boolean);
  }
}
