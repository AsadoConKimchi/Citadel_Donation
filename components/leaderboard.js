// Citadel POW Leaderboard 컴포넌트
// Phase 2: 재사용 가능한 리더보드 렌더링

/**
 * Leaderboard 컴포넌트
 * POW 시간 또는 기부 금액 기준 리더보드 표시
 */
class Leaderboard {
  /**
   * @param {Object} options - Leaderboard 옵션
   * @param {HTMLElement} options.container - 리더보드를 렌더링할 컨테이너
   * @param {string} options.type - 리더보드 타입 ('time' | 'donation')
   * @param {string} options.category - 카테고리 (기본: 'all')
   * @param {number} options.limit - 표시할 항목 수 (기본: 10)
   * @param {Function} options.renderItem - 커스텀 아이템 렌더링 함수 (선택)
   */
  constructor(options) {
    this.container = options.container;
    this.type = options.type || 'time';
    this.category = options.category || 'all';
    this.limit = options.limit || 10;
    this.renderItem = options.renderItem || this.defaultRenderItem.bind(this);

    this.data = [];
    this.loading = false;
  }

  /**
   * 리더보드 데이터 가져오기 및 렌더링
   */
  async fetch() {
    if (!this.container) return;

    this.loading = true;
    this.showLoading();

    try {
      let response;

      if (this.type === 'time' || this.type === 'donation') {
        // 분야별 랭킹 API 사용
        response = await fetch(
          `${window.BACKEND_API_URL || ''}/api/rankings/by-category?type=${this.type}&category=${this.category}&limit=${this.limit}`
        );
      } else if (this.type === 'top-donors') {
        // Top 기부자 API 사용
        response = await fetch(
          `${window.BACKEND_API_URL || ''}/api/donations/top?category=${this.category}&limit=${this.limit}`
        );
      } else {
        throw new Error(`지원하지 않는 리더보드 타입: ${this.type}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '데이터를 불러올 수 없습니다.');
      }

      this.data = result.data || [];
      this.render();
    } catch (error) {
      console.error('리더보드 로드 실패:', error);
      this.showError(error.message);
    } finally {
      this.loading = false;
    }
  }

  /**
   * 리더보드 렌더링
   */
  render() {
    if (!this.container) return;

    if (this.data.length === 0) {
      this.showEmpty();
      return;
    }

    this.container.innerHTML = this.data
      .map((item, index) => this.renderItem(item, index))
      .join('');
  }

  /**
   * 기본 아이템 렌더링 함수
   * @param {Object} item - 리더보드 아이템
   * @param {number} index - 인덱스
   * @returns {string} HTML 문자열
   */
  defaultRenderItem(item, index) {
    const rank = item.rank || (index + 1);
    const username = item.discord_username || '알 수 없음';
    const avatar = item.discord_avatar
      ? `https://cdn.discordapp.com/avatars/${item.discord_id}/${item.discord_avatar}.png`
      : '';

    let valueText = '';

    if (this.type === 'time') {
      // POW 시간 기준
      const minutes = item.total_minutes || 0;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      valueText = hours > 0
        ? `${hours}시간 ${remainingMinutes}분`
        : `${minutes}분`;
    } else if (this.type === 'donation' || this.type === 'top-donors') {
      // 기부 금액 기준
      const total = item.total_donations || item.total_donated || 0;
      valueText = `${formatNumber(total)} sats`;
    }

    // 메달 표시 (1-3위)
    let rankBadge = `<span class="rank">${rank}</span>`;
    if (rank === 1) {
      rankBadge = '<span class="rank gold">🥇</span>';
    } else if (rank === 2) {
      rankBadge = '<span class="rank silver">🥈</span>';
    } else if (rank === 3) {
      rankBadge = '<span class="rank bronze">🥉</span>';
    }

    return `
      <li class="leaderboard-item rank-${rank}">
        <div class="leaderboard-left">
          ${rankBadge}
          ${avatar ? `<img src="${avatar}" alt="${username}" class="leaderboard-avatar" />` : ''}
          <span class="leaderboard-username">${username}</span>
        </div>
        <div class="leaderboard-right">
          <span class="leaderboard-value">${valueText}</span>
        </div>
      </li>
    `;
  }

  /**
   * 로딩 상태 표시
   */
  showLoading() {
    if (!this.container) return;
    this.container.innerHTML = '<li class="hint">로딩 중...</li>';
  }

  /**
   * 에러 메시지 표시
   * @param {string} message - 에러 메시지
   */
  showError(message) {
    if (!this.container) return;
    this.container.innerHTML = `<li class="hint error">${message}</li>`;
  }

  /**
   * 빈 상태 표시
   */
  showEmpty() {
    if (!this.container) return;

    let emptyMessage = '데이터가 없습니다.';

    if (this.type === 'time') {
      emptyMessage = '아직 POW 기록이 없습니다.';
    } else if (this.type === 'donation' || this.type === 'top-donors') {
      emptyMessage = '아직 기부 기록이 없습니다.';
    }

    this.container.innerHTML = `<li class="hint">${emptyMessage}</li>`;
  }

  /**
   * 리더보드 타입 변경
   * @param {string} type - 새로운 타입
   */
  setType(type) {
    this.type = type;
    return this;
  }

  /**
   * 카테고리 변경
   * @param {string} category - 새로운 카테고리
   */
  setCategory(category) {
    this.category = category;
    return this;
  }

  /**
   * 표시 항목 수 변경
   * @param {number} limit - 새로운 limit
   */
  setLimit(limit) {
    this.limit = limit;
    return this;
  }

  /**
   * 설정 변경 후 리로드
   */
  async reload() {
    await this.fetch();
  }

  /**
   * 리더보드 데이터 가져오기 (렌더링 없이)
   * @returns {Array} 리더보드 데이터
   */
  getData() {
    return this.data;
  }

  /**
   * 리더보드 초기화
   */
  clear() {
    this.data = [];
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// 전역 함수로 formatNumber 추가 (common.js에 있지만 여기서도 정의)
if (typeof formatNumber === 'undefined') {
  function formatNumber(num) {
    return num.toLocaleString('ko-KR');
  }
}
