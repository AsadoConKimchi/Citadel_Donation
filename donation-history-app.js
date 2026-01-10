// 기부 기록 - donation-history.html 전용 스크립트
// Phase 5: Top 5 대시보드 + 월별 리스트 개선

// ============================================
// DOM 요소 선택
// ============================================

// 나의 기부현황
const donationPageDonated = document.getElementById("donation-page-donated");
const donationPageAccumulated = document.getElementById("donation-page-accumulated");
const donationPageAccumulatedRow = document.getElementById("donation-page-accumulated-row");
const donationPagePay = document.getElementById("donation-page-pay");

// Top 5 대시보드
const donationCategoryFilter = document.getElementById("donation-category-filter");
const donationLeaderboardTitle = document.getElementById("donation-leaderboard-title");
const donationLeaderboard = document.getElementById("donation-leaderboard");

// 나의 기부 기록
const donationRecordCategoryFilter = document.getElementById("donation-record-category-filter");
const donationMonthSelect = document.getElementById("donation-month-select");
const donationHistoryMonth = document.getElementById("donation-history-month");
const donationHistoryList = document.getElementById("donation-history-list");
const donationHistoryEmptyPage = document.getElementById("donation-history-empty-page");
const donationHistoryPagination = document.getElementById("donation-history-pagination");

// ============================================
// 상태 관리
// ============================================

let currentUser = null;
let currentDonationCategory = "all"; // Top 5 필터
let currentRecordCategory = "all"; // 나의 기록 필터
let currentMonth = null;
let allDonations = []; // 모든 기부 기록 (캐시)
let filteredDonations = []; // 필터링된 기부 기록

// ============================================
// 컴포넌트 초기화
// ============================================

// Leaderboard 컴포넌트 초기화 (Top 5)
const topDonorsLeaderboard = new Leaderboard({
  container: donationLeaderboard,
  type: 'top-donors',
  category: currentDonationCategory,
  limit: 5,
});

// ============================================
// 세션 로드
// ============================================

const loadSession = async () => {
  try {
    const session = await getDiscordSession();
    if (session.authenticated && session.user) {
      currentUser = session.user;
      console.log("로그인된 사용자:", currentUser.username);
      return true;
    }
    return false;
  } catch (error) {
    console.error("세션 로드 실패:", error);
    return false;
  }
};

// ============================================
// Top 5 대시보드 로드
// ============================================

const loadTopDonors = async () => {
  try {
    // 리더보드 타이틀 업데이트
    updateDonationLeaderboardTitle();

    // Leaderboard 설정 및 데이터 가져오기
    await topDonorsLeaderboard
      .setCategory(currentDonationCategory)
      .reload();
  } catch (error) {
    console.error("Top 5 로드 실패:", error);
    showError(donationLeaderboard, "데이터를 불러올 수 없습니다.");
  }
};

/**
 * Top 5 리더보드 타이틀 업데이트
 */
const updateDonationLeaderboardTitle = () => {
  const categoryName = getCategoryName(currentDonationCategory);

  if (currentDonationCategory === "all") {
    donationLeaderboardTitle.textContent = "전체 누적 기부액 TOP 5";
  } else {
    donationLeaderboardTitle.textContent = `${categoryName} 누적 기부액 TOP 5`;
  }
};

// ============================================
// 나의 기부 현황 로드
// ============================================

const loadMyDonationStatus = async () => {
  if (!currentUser) return;

  try {
    // 나의 기부 내역 가져오기
    const response = await DonationAPI.getByUser(currentUser.id);

    if (response.success) {
      const totalDonated = response.user?.total_donated || 0;
      donationPageDonated.textContent = `${formatNumber(totalDonated)} sats`;
    }

    // 현재 적립액 가져오기 (오늘 날짜)
    const todayKey = getTodayKey();
    try {
      const accResponse = await AccumulatedSatsAPI.get(currentUser.id, todayKey);
      if (accResponse.success && accResponse.data) {
        const accumulated = accResponse.data.total_sats || 0;
        donationPageAccumulated.textContent = `${formatNumber(accumulated)} sats`;
        toggleElement(donationPageAccumulatedRow, true);
      } else {
        toggleElement(donationPageAccumulatedRow, false);
      }
    } catch (error) {
      toggleElement(donationPageAccumulatedRow, false);
    }
  } catch (error) {
    console.error("나의 기부 현황 로드 실패:", error);
  }
};

// ============================================
// 나의 기부 기록 로드
// ============================================

const loadMyDonations = async () => {
  if (!currentUser) return;

  try {
    // API에서 나의 모든 기부 내역 가져오기
    const response = await DonationAPI.getByUser(currentUser.id);

    if (!response.success) {
      throw new Error(response.error || '데이터를 불러올 수 없습니다.');
    }

    allDonations = response.user?.donations || [];
    console.log(`${allDonations.length}개의 기부 내역 로드됨`);

    // 월별 그룹화 및 월 선택 옵션 렌더링
    renderMonthOptions();

    // 필터 적용
    applyDonationFilters();
  } catch (error) {
    console.error("나의 기부 기록 로드 실패:", error);
    toggleElement(donationHistoryEmptyPage, true);
    donationHistoryEmptyPage.textContent = "데이터를 불러올 수 없습니다.";
  }
};

/**
 * 월 선택 옵션 렌더링
 */
const renderMonthOptions = () => {
  if (allDonations.length === 0) {
    donationMonthSelect.innerHTML = '<option value="">기부 기록 없음</option>';
    return;
  }

  // 월별 그룹화
  const donationsByMonth = groupByMonth(allDonations, 'created_at');
  const months = Object.keys(donationsByMonth).sort().reverse();

  // 월 선택 옵션 렌더링
  donationMonthSelect.innerHTML = months
    .map(month => `<option value="${month}">${month}</option>`)
    .join("");

  // 기본값: 최근 월
  if (months.length > 0) {
    currentMonth = months[0];
    donationMonthSelect.value = currentMonth;
  }
};

/**
 * 필터 적용
 */
const applyDonationFilters = () => {
  if (allDonations.length === 0) {
    filteredDonations = [];
    renderDonationList();
    return;
  }

  // 필터링 시작
  filteredDonations = allDonations.filter(donation => {
    // 1. 분야 필터
    if (currentRecordCategory && currentRecordCategory !== 'all') {
      if (donation.donation_mode !== currentRecordCategory) {
        return false;
      }
    }

    // 2. 월 필터
    if (currentMonth) {
      const donationMonth = formatDate(donation.created_at).slice(0, 7); // YYYY-MM
      if (donationMonth !== currentMonth) {
        return false;
      }
    }

    return true;
  });

  console.log(`필터링 결과: ${filteredDonations.length}개`);

  // 리스트 렌더링
  renderDonationList();
};

/**
 * 기부 내역 리스트 렌더링
 */
const renderDonationList = () => {
  donationHistoryMonth.textContent = currentMonth || "-";

  if (filteredDonations.length === 0) {
    donationHistoryList.innerHTML = "";
    toggleElement(donationHistoryEmptyPage, true);
    donationHistoryEmptyPage.textContent = "선택한 조건의 기부 기록이 없습니다.";
    return;
  }

  // 날짜 내림차순 정렬
  filteredDonations.sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // 리스트 렌더링
  donationHistoryList.innerHTML = filteredDonations
    .map(donation => {
      const date = formatDate(donation.created_at);
      const amount = donation.amount || 0;
      const categoryEmoji = getCategoryEmoji(donation.donation_mode);
      const categoryName = getCategoryName(donation.donation_mode);
      const note = donation.note || "";

      return `
        <div class="history-item">
          <div class="history-item-left">
            <span class="history-date">${date}</span>
            <span class="history-category">${categoryEmoji} ${categoryName}</span>
          </div>
          <div class="history-item-right">
            <span class="history-amount">${formatNumber(amount)} sats</span>
          </div>
          ${note ? `<div class="history-note">${note}</div>` : ''}
        </div>
      `;
    })
    .join("");

  toggleElement(donationHistoryEmptyPage, false);
};

// ============================================
// 이벤트 리스너
// ============================================

// Top 5 분야 선택 변경
donationCategoryFilter?.addEventListener("change", (e) => {
  currentDonationCategory = e.target.value;
  loadTopDonors();
});

// 나의 기록 분야 선택 변경
donationRecordCategoryFilter?.addEventListener("change", (e) => {
  currentRecordCategory = e.target.value;
  applyDonationFilters();
});

// 월 선택 변경
donationMonthSelect?.addEventListener("change", (e) => {
  currentMonth = e.target.value;
  applyDonationFilters();
});

// 적립액 기부하기 버튼
donationPagePay?.addEventListener("click", async () => {
  if (!currentUser) {
    alert("로그인이 필요합니다.");
    return;
  }

  const todayKey = getTodayKey();

  try {
    // 오늘의 적립액 가져오기
    const accResponse = await AccumulatedSatsAPI.get(currentUser.id, todayKey);

    if (!accResponse.success || !accResponse.data) {
      alert("적립액이 없습니다.");
      return;
    }

    const accumulated = accResponse.data.total_sats || 0;

    if (accumulated <= 0) {
      alert("적립액이 없습니다.");
      return;
    }

    const confirmed = confirm(`${formatNumber(accumulated)} sats를 기부하시겠습니까?`);

    if (!confirmed) return;

    // 기부 생성
    await DonationAPI.create(currentUser.id, {
      amount: accumulated,
      currency: 'SAT',
      donation_mode: accResponse.data.donation_mode || 'pow-writing',
      donation_scope: 'total',
      note: '일일 적립액 기부',
      plan_text: accResponse.data.plan_text,
      accumulated_sats: accumulated,
      total_accumulated_sats: accumulated,
      status: 'completed',
      date: todayKey,
    });

    // 적립액 삭제
    await AccumulatedSatsAPI.delete(currentUser.id, todayKey);

    alert("기부가 완료되었습니다!");

    // 데이터 새로고침
    await loadMyDonationStatus();
    await loadMyDonations();
  } catch (error) {
    console.error("기부 실패:", error);
    alert("기부에 실패했습니다. 다시 시도해주세요.");
  }
});

// ============================================
// 초기화
// ============================================

(async () => {
  const loggedIn = await loadSession();

  // Top 5 대시보드는 로그인 여부와 무관하게 표시
  await loadTopDonors();

  if (loggedIn) {
    // 로그인 상태면 나의 기부 현황 및 기록 로드
    await loadMyDonationStatus();
    await loadMyDonations();
  } else {
    // 비로그인 상태
    donationPageDonated.textContent = "로그인 필요";
    toggleElement(donationPageAccumulatedRow, false);
    donationPagePay.disabled = true;

    donationMonthSelect.innerHTML = '<option value="">로그인이 필요합니다</option>';
    toggleElement(donationHistoryEmptyPage, true);
    donationHistoryEmptyPage.textContent = "로그인이 필요합니다.";
  }
})();
