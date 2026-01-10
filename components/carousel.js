// Citadel POW Carousel 컴포넌트
// Phase 2: 재사용 가능한 인증카드 스와이프 Carousel

/**
 * Carousel 컴포넌트
 * 인증카드 슬라이드를 위한 터치/키보드 지원 Carousel
 */
class Carousel {
  /**
   * @param {Object} options - Carousel 옵션
   * @param {HTMLElement} options.container - Carousel 컨테이너 요소
   * @param {HTMLElement} options.track - Carousel 트랙 요소 (카드들의 부모)
   * @param {HTMLElement} options.prevButton - 이전 버튼
   * @param {HTMLElement} options.nextButton - 다음 버튼
   * @param {HTMLElement} options.indicator - 인디케이터 요소 (예: "1 / 5")
   * @param {Function} options.renderCard - 카드 렌더링 함수
   */
  constructor(options) {
    this.container = options.container;
    this.track = options.track;
    this.prevButton = options.prevButton;
    this.nextButton = options.nextButton;
    this.indicator = options.indicator;
    this.renderCard = options.renderCard || this.defaultRenderCard.bind(this);

    this.items = [];
    this.currentIndex = 0;
    this.touchStartX = 0;
    this.touchEndX = 0;

    this.init();
  }

  /**
   * Carousel 초기화
   */
  init() {
    // 버튼 이벤트 리스너
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => this.prev());
    }

    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => this.next());
    }

    // 터치 이벤트 리스너
    if (this.container) {
      this.container.addEventListener('touchstart', (e) => this.handleTouchStart(e), false);
      this.container.addEventListener('touchend', (e) => this.handleTouchEnd(e), false);
    }

    // 키보드 이벤트 리스너
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  /**
   * 아이템 설정 및 렌더링
   * @param {Array} items - 표시할 아이템 배열
   * @param {number} startIndex - 시작 인덱스 (기본: 0)
   */
  setItems(items, startIndex = 0) {
    this.items = items;
    this.currentIndex = startIndex;
    this.render();
  }

  /**
   * 현재 인덱스로 이동
   * @param {number} index - 이동할 인덱스
   */
  goTo(index) {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;
      this.render();
    }
  }

  /**
   * 다음 카드로 이동
   */
  next() {
    if (this.currentIndex < this.items.length - 1) {
      this.currentIndex++;
      this.render();
    }
  }

  /**
   * 이전 카드로 이동
   */
  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.render();
    }
  }

  /**
   * Carousel 렌더링
   */
  render() {
    if (!this.track || this.items.length === 0) {
      if (this.container) {
        this.container.classList.add('hidden');
      }
      return;
    }

    if (this.container) {
      this.container.classList.remove('hidden');
    }

    // 카드 렌더링
    this.track.innerHTML = this.items
      .map((item, index) => this.renderCard(item, index, this.currentIndex))
      .join('');

    // 인디케이터 업데이트
    this.updateIndicator();

    // 버튼 상태 업데이트
    this.updateButtons();

    // 슬라이드 위치 업데이트
    this.updatePosition();
  }

  /**
   * 기본 카드 렌더링 함수 (오버라이드 가능)
   * @param {Object} item - 아이템 데이터
   * @param {number} index - 인덱스
   * @param {number} currentIndex - 현재 활성화된 인덱스
   * @returns {string} HTML 문자열
   */
  defaultRenderCard(item, index, currentIndex) {
    const photoUrl = item.photo_url;
    const minutes = item.duration_minutes || 0;
    const plan = item.plan_text || "계획 없음";
    const isActive = index === currentIndex;

    if (photoUrl && photoUrl !== "data:,") {
      // 인증카드 이미지가 있으면 이미지 표시
      return `
        <div class="carousel-card ${isActive ? 'active' : ''}" data-index="${index}">
          <img src="${photoUrl}" alt="POW 인증카드" class="pow-badge-image" />
        </div>
      `;
    } else {
      // 인증카드 이미지가 없으면 텍스트 표시
      return `
        <div class="carousel-card ${isActive ? 'active' : ''}" data-index="${index}">
          <div class="pow-text-card">
            <div class="pow-text-time">${minutes}분</div>
            <div class="pow-text-plan">${plan}</div>
          </div>
        </div>
      `;
    }
  }

  /**
   * 인디케이터 업데이트
   */
  updateIndicator() {
    if (this.indicator) {
      this.indicator.textContent = `${this.currentIndex + 1} / ${this.items.length}`;
    }
  }

  /**
   * 버튼 상태 업데이트
   */
  updateButtons() {
    if (this.prevButton) {
      this.prevButton.disabled = this.currentIndex === 0;
    }

    if (this.nextButton) {
      this.nextButton.disabled = this.currentIndex === this.items.length - 1;
    }
  }

  /**
   * 슬라이드 위치 업데이트
   */
  updatePosition() {
    if (!this.track) return;

    const offset = -this.currentIndex * 100;
    this.track.style.transform = `translateX(${offset}%)`;
  }

  /**
   * 터치 시작 핸들러
   * @param {TouchEvent} e - 터치 이벤트
   */
  handleTouchStart(e) {
    this.touchStartX = e.changedTouches[0].screenX;
  }

  /**
   * 터치 종료 핸들러
   * @param {TouchEvent} e - 터치 이벤트
   */
  handleTouchEnd(e) {
    this.touchEndX = e.changedTouches[0].screenX;
    this.handleSwipe();
  }

  /**
   * 스와이프 처리
   */
  handleSwipe() {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // 왼쪽으로 스와이프 = 다음 카드
        this.next();
      } else {
        // 오른쪽으로 스와이프 = 이전 카드
        this.prev();
      }
    }
  }

  /**
   * 키보드 핸들러
   * @param {KeyboardEvent} e - 키보드 이벤트
   */
  handleKeydown(e) {
    // Carousel이 보이지 않으면 무시
    if (!this.container || this.container.classList.contains('hidden')) {
      return;
    }

    if (e.key === 'ArrowLeft') {
      this.prev();
    } else if (e.key === 'ArrowRight') {
      this.next();
    }
  }

  /**
   * Carousel 숨기기
   */
  hide() {
    if (this.container) {
      this.container.classList.add('hidden');
    }
  }

  /**
   * Carousel 표시
   */
  show() {
    if (this.container) {
      this.container.classList.remove('hidden');
    }
  }

  /**
   * 현재 아이템 가져오기
   * @returns {any} 현재 아이템
   */
  getCurrentItem() {
    return this.items[this.currentIndex];
  }

  /**
   * 모든 아이템 가져오기
   * @returns {Array} 모든 아이템
   */
  getItems() {
    return this.items;
  }

  /**
   * Carousel 초기화 (아이템 제거)
   */
  clear() {
    this.items = [];
    this.currentIndex = 0;
    if (this.track) {
      this.track.innerHTML = '';
    }
    this.hide();
  }
}
