const today = new Date();

const state = {
  year: today.getFullYear(),
  month: today.getMonth(),
  view: 'dates',
  lastYearOfRange: today.getFullYear() + 13
};

const currentDate = document.querySelector('.datepicker-view-change-button');
const prevnexIcon = document.querySelectorAll('.datepicker-arrow-controls span');
const daysTag = document.querySelector('.datepicker-table tbody');
const weekHead = document.querySelector('.datepicker-table thead');
const birth = document.getElementById('birthday');
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const weekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const rangeCount = 24;
const getRecentYears = () => {
  const lastYear = state.lastYearOfRange;
  return Array.from({ length: rangeCount }, (_, i) => lastYear - rangeCount + 1 + i);
};

function setState(newState) {
  Object.assign(state, newState);
  weekHead.style.display = state.view === 'dates' ? '' : 'none';
  updateHeader();
  if (state.view === 'years') renderYears();
  else if (state.view === 'months') renderMonths();
  else renderCalendar();
}

const renderYears = () => {
  const recentYear = getRecentYears();

  let html = '<tr>';
  for (let s = 0; s < rangeCount; s++) {

    html += `<td class="datepicker-cell datepicker-large-cell datepicker-year-cell">
          <div class="datepicker-cell-content datepicker-large-cell-content">${recentYear[s]}</div></td>`;
    if (s % 4 === 3 && s < rangeCount - 1) {      // 每 4 個換列
      html += '</tr><tr>';
    }
  }
  html += '</tr>';
  daysTag.innerHTML = html;
};

const renderMonths = () => {
  let html = '<tr>';
  months.forEach((month, i) => {
    let m = month.substring(0, 3);
    html += `<td class="datepicker-cell datepicker-large-cell datepicker-month-cell" data-month="${i}">
              <div class="datepicker-cell-content datepicker-large-cell-content">${m}</div></td>`;
    if (i % 4 === 3 && i < 11) html += '</tr><tr>';   // 每 4 個換列
  });
  html += '</tr>';
  daysTag.innerHTML = html;
};


const renderCalendar = () => {
  const firstDay = new Date(state.year, state.month, 1).getDay();
  const lastDateofMonth = new Date(state.year, state.month + 1, 0).getDate(); // 這個月最後一天
  const lastDateOfPrev = new Date(state.year, state.month, 0).getDate();
  let trTag = "<tr>";

  // 上個月的補位格
  for (let i = firstDay; i > 0; i--) {
    trTag += `<td class="datepicker-cell datepicker-small-cell datepicker-day-cell disabled other-month">
                <div class="datepicker-cell-content datepicker-small-cell-content" style="display: none;">${lastDateOfPrev - i + 1}</div></td>`;
  }

  // 這個月的日期
  for (let i = 1; i <= lastDateofMonth; i++) {
    const contentClass = 'datepicker-cell-content datepicker-small-cell-content';

    const isToday = i === today.getDate()
      && state.month === today.getMonth()
      && state.year === today.getFullYear();

    const weekDay = (firstDay + i - 1) % 7;
    const weekName = weekNames[weekDay];

    trTag += `<td class="datepicker-cell datepicker-small-cell datepicker-day-cell${isToday ? ' current' : ''}" aria-label= "${weekName}, ${months[state.month]} ${i}, ${state.year}" data-mdb-date="${state.year}-${String(state.month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}" aria-selected="false">
                <div class="${contentClass}" style="display: block;">${i}</div></td>`;


    if ((firstDay + i) % 7 === 0 && i !== lastDateofMonth) trTag += '</tr><tr>';
  }

  // 下個月的補位格
  const nextDays = (7 - (firstDay + lastDateofMonth) % 7) % 7;
  for (let i = 1; i <= nextDays; i++) {
    trTag += `<td class="datepicker-cell datepicker-small-cell datepicker-day-cell disabled other-month">
                <div class="datepicker-cell-content datepicker-small-cell-content" style="display: none;">${i}</div></td>`;
  }

  trTag += '</tr>';
  daysTag.innerHTML = trTag;
};

const updateHeader = () => {
  if (state.view === 'years') {
    const y = getRecentYears();
    currentDate.textContent = `${y[0]} - ${y[y.length - 1]}`;
    currentDate.setAttribute('aria-label', 'Switch to date list');
  } else if (state.view === 'months') {
    currentDate.textContent = state.year;
  } else if (state.view === 'dates') {
    currentDate.textContent = `${months[state.month]} ${state.year}`;
    currentDate.setAttribute('aria-label', 'Switch to year list');
  }
};

// 按鈕切換「天數檢視 / 年份檢視 / 月份檢視」
currentDate.addEventListener('click', () => {
  // 判斷當前視圖，切換到另一個
  const nextView = state.view === 'dates' ? 'years' : 'dates';

  // 使用 setState 統一處理
  setState({ view: nextView });

  });

daysTag.addEventListener('click', (e) => {
  if (state.view === 'years') {
    const cell = e.target.closest('.datepicker-year-cell');
    if (!cell) return;

    const selectedYear = parseInt(cell.textContent.trim(), 10);
    // 使用 setState 更新年份並切換視圖
    setState({ year: selectedYear, view: 'months' });
  } else if (state.view === 'months') {
    const cell = e.target.closest('.datepicker-month-cell');
    if (!cell) return;

    const selectedMonth = parseInt(cell.dataset.month, 10);
    // 使用 setState 更新月份並切換視圖
    setState({ month: selectedMonth, view: 'dates' });
  } else if (state.view === 'dates') {
    const cell = e.target.closest('.datepicker-day-cell');
    if (!cell || cell.classList.contains('other-month')) return;

    const prevSelected = daysTag.querySelector('.datepicker-cell.selected');
    if (prevSelected) {
      prevSelected.classList.remove('selected', 'focused');
      prevSelected.setAttribute('aria-selected', 'false');
    }

    cell.classList.add('selected', 'focused');
    cell.setAttribute('aria-selected', 'true');

    selectedDate = new Date(state.year, state.month, parseInt(cell.textContent.trim(), 10));

    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');

    const weekDay = selectedDate.getDay() // 0~6
    const weekName = weekNames[weekDay];

    birth.value = `${yyyy}-${mm}-${dd}`;
  }
})


// 左右箭頭
prevnexIcon.forEach(icon => {
  icon.addEventListener('click', () => {
    const isPrev = icon.id === 'prev';

    if (state.view === 'dates') {
      let newMonth = state.month + (isPrev ? -1 : 1);
      let newYear = state.year;
      if (newMonth < 0) { newMonth = 11; newYear--; }
      if (newMonth > 11) { newMonth = 0; newYear++; }
      setState({ month: newMonth, year: newYear });
    }
    else if (state.view === 'years') {
      setState({ lastYearOfRange: state.lastYearOfRange + (isPrev ? -rangeCount : rangeCount) });
    }
    else if (state.view === 'months') {
      setState({ year: state.year + (isPrev ? -1 : 1) });
    }
  });
});

// 初始渲染
updateHeader();
renderCalendar();
