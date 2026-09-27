// Month-level dates use inclusive calendar months, consistently with the
// completed roles (May 2023–April 2024 = 12 months). No start day is invented.
export function currentMonthInMadrid(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit'
  }).formatToParts(date);
  return `${parts.find(part => part.type === 'year').value}-${parts.find(part => part.type === 'month').value}`;
}

export function inclusiveMonths(start, end) {
  const [startYear, startMonth] = start.split('-').map(Number);
  const [endYear, endMonth] = end.split('-').map(Number);
  return Math.max(0, (endYear - startYear) * 12 + endMonth - startMonth + 1);
}

export function formatTenure(months, compact = false) {
  const years = Math.floor(months / 12), remainder = months % 12, parts = [];
  if (years) parts.push(`${years} ${compact ? (years === 1 ? 'YR' : 'YRS') : (years === 1 ? 'YEAR' : 'YEARS')}`);
  if (remainder || !years) parts.push(`${remainder} ${compact ? (remainder === 1 ? 'MO' : 'MOS') : (remainder === 1 ? 'MONTH' : 'MONTHS')}`);
  return parts.join(' ');
}

const roles = [
  { start: '2024-04', end: null, location: 'AIRBUS · GETAFE · MRTT' },
  { start: '2023-05', end: '2024-04', location: 'AIRBUS · GETAFE · EURODRONE' },
  { start: '2022-10', end: '2023-05', location: 'AIRBUS · GETAFE · PROCUREMENT & SUPPLY CHAIN' },
  { start: '2022-05', end: '2022-10', location: 'DELOITTE · MADRID · STELLANTIS C1ST' },
  { start: '2021-11', end: '2022-04', location: 'EY · MADRID · MULTI-INDUSTRY R&D' }
];
function monthLabel(value) {
  return new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${value}-01T12:00:00Z`)).toUpperCase();
}
export function updateCareerDates(date = new Date()) {
  const month = currentMonthInMadrid(date);
  const total = document.querySelector('.airbus-tenure strong');
  if (total) total.textContent = formatTenure(inclusiveMonths('2022-10', month));
  document.querySelectorAll('.log-entry').forEach((entry, index) => {
    const role = roles[index], meta = entry.querySelector('.log-meta');
    if (!role || !meta) return;
    meta.querySelector('span').textContent = `${monthLabel(role.start)} — ${role.end ? monthLabel(role.end) : 'PRESENT'} · ${formatTenure(inclusiveMonths(role.start, role.end || month), true)}`;
    meta.querySelector('small').textContent = role.location;
  });
}
if (typeof document !== 'undefined') {
  updateCareerDates();
  addEventListener('pageshow', () => updateCareerDates());
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateCareerDates(); });
  setInterval(() => { if (!document.hidden) updateCareerDates(); }, 60_000);
}
