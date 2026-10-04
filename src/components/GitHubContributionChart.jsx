import { useState, useEffect, useMemo } from 'react';
import { GitCommit, Flame, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import bundledContributions from '../data/github-contributions.json';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = [
  { label: '', row: 0 },
  { label: 'Mon', row: 1 },
  { label: '', row: 2 },
  { label: 'Wed', row: 3 },
  { label: '', row: 4 },
  { label: 'Fri', row: 5 },
  { label: '', row: 6 },
];

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function computeYearData(year, rawData) {
  const allDays = (rawData?.contributions || []).filter((c) =>
    c.date.startsWith(String(year)),
  );

  if (!allDays.length) {
    return {
      year,
      weeks: [],
      months: [],
      totalCount: 0,
      activeDays: 0,
      maxStreak: 0,
    };
  }

  // Calculate stats
  let totalCount = 0;
  let activeDays = 0;
  let maxStreak = 0;
  let currentStreak = 0;

  for (const day of allDays) {
    totalCount += day.count || 0;
    if ((day.count || 0) > 0) {
      activeDays++;
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }

  // Standard 7-row Sunday-Saturday calendar alignment
  const [firstY, firstM, firstD] = allDays[0].date.split('-').map(Number);
  const firstDate = new Date(Date.UTC(firstY, firstM - 1, firstD));
  const startDay = firstDate.getUTCDay(); // 0 is Sunday, 6 is Saturday

  const weeks = [];
  let currentWeek = [];

  // Pad days before start of year
  for (let i = 0; i < startDay; i++) {
    currentWeek.push(null);
  }

  for (const day of allDays) {
    currentWeek.push({
      date: day.date,
      count: day.count || 0,
      level: day.level ?? (day.count > 0 ? 1 : 0),
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Pad end of last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  // Determine month label positions by finding where each new month begins
  const months = [];
  let lastMonth = -1;

  weeks.forEach((week, wIdx) => {
    const firstValidDay = week.find((d) => d !== null);
    if (firstValidDay) {
      const [, mStr] = firstValidDay.date.split('-');
      const mIdx = Number(mStr) - 1;
      if (mIdx !== lastMonth) {
        months.push({
          month: MONTH_NAMES[mIdx],
          col: wIdx,
        });
        lastMonth = mIdx;
      }
    }
  });

  return {
    year,
    weeks,
    months,
    totalCount: rawData?.total?.[year] ?? totalCount,
    activeDays,
    maxStreak,
  };
}

export default function GitHubContributionChart() {
  const [contributionData, setContributionData] = useState(bundledContributions);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Background fetch live data from public GitHub contributions API
  useEffect(() => {
    let isMounted = true;
    fetch('https://github-contributions-api.jogruber.de/v4/Mohamed-Arif-J?y=all')
      .then((res) => {
        if (!res.ok) throw new Error('API fetch failed');
        return res.json();
      })
      .then((data) => {
        if (isMounted && data?.contributions?.length) {
          setContributionData(data);
        }
      })
      .catch(() => {
        // Silently keep using bundled data
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const years = useMemo(() => {
    const rawYears = Object.keys(contributionData?.total || {}).map(Number);
    return rawYears.length ? rawYears.sort((a, b) => b - a) : [2026, 2025, 2024];
  }, [contributionData]);

  const currentData = useMemo(() => {
    return computeYearData(selectedYear, contributionData);
  }, [selectedYear, contributionData]);

  return (
    <div className="gh-chart-container reveal-card">
      {/* Chart Header */}
      <div className="gh-chart-header">
        <div className="gh-chart-title-wrap">
          <GitCommit size={18} className="gh-chart-icon" />
          <h4>GitHub Contributions</h4>
          <span className="gh-verified-tag">
            <CheckCircle2 size={13} />
            Verified @Mohamed-Arif-J
          </span>
        </div>
        <span className="gh-chart-total-pill">
          <Sparkles size={13} />
          <strong>{currentData.totalCount}</strong> contributions in {selectedYear}
        </span>
      </div>

      {/* Real Metrics Banner */}
      <div className="gh-chart-metrics">
        <div className="gh-metric-item">
          <span className="gh-metric-label">Year Total</span>
          <span className="gh-metric-value">{currentData.totalCount} contributions</span>
        </div>
        <div className="gh-metric-item">
          <span className="gh-metric-label">Active Days</span>
          <span className="gh-metric-value">
            <Calendar size={13} /> {currentData.activeDays} days
          </span>
        </div>
        <div className="gh-metric-item">
          <span className="gh-metric-label">Max Streak</span>
          <span className="gh-metric-value">
            <Flame size={13} className="streak-flame" /> {currentData.maxStreak} days
          </span>
        </div>
      </div>

      {/* Interactive Heatmap Scrollable Wrapper */}
      <div className="gh-heatmap-scroll">
        <div className="gh-heatmap-inner" style={{ minWidth: `${Math.max(540, currentData.weeks.length * 14 + 40)}px` }}>
          {/* Months header aligned by column position */}
          <div className="gh-months-row-rel">
            {currentData.months.map(({ month, col }) => (
              <span
                key={`${month}-${col}`}
                className="gh-month-label"
                style={{ left: `${30 + col * 14}px` }}
              >
                {month}
              </span>
            ))}
          </div>

          <div className="gh-grid-body">
            {/* Day of week labels */}
            <div className="gh-days-col">
              {DAY_LABELS.map((d, idx) => (
                <span key={idx} className="gh-day-label">
                  {d.label}
                </span>
              ))}
            </div>

            {/* Commit Matrix */}
            <div className="gh-matrix">
              {currentData.weeks.map((week, wIdx) => (
                <div key={wIdx} className="gh-matrix-col">
                  {week.map((day, dIdx) => {
                    if (!day) {
                      return <div key={dIdx} className="gh-cell gh-cell-empty" />;
                    }

                    return (
                      <div
                        key={dIdx}
                        className={`gh-cell gh-level-${day.level}`}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredCell({
                            date: formatDisplayDate(day.date),
                            count: day.count,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                        data-count={day.count}
                        data-date={day.date}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Floating Tooltip */}
          {hoveredCell && (
            <div
              className="gh-cell-tooltip"
              style={{
                position: 'fixed',
                left: `${hoveredCell.x}px`,
                top: `${hoveredCell.y - 10}px`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <strong>
                {hoveredCell.count === 0
                  ? 'No contributions'
                  : `${hoveredCell.count} contribution${hoveredCell.count > 1 ? 's' : ''}`}
              </strong>{' '}
              on {hoveredCell.date}
            </div>
          )}

          {/* Legend */}
          <div className="gh-legend-row">
            <span className="gh-legend-text">Less</span>
            <div className="gh-cell gh-level-0" title="0 contributions" />
            <div className="gh-cell gh-level-1" title="1-3 contributions" />
            <div className="gh-cell gh-level-2" title="4-6 contributions" />
            <div className="gh-cell gh-level-3" title="7-9 contributions" />
            <div className="gh-cell gh-level-4" title="10+ contributions" />
            <span className="gh-legend-text">More</span>
          </div>
        </div>
      </div>

      {/* Year Switcher Buttons underneath chart */}
      <div className="gh-year-buttons">
        <span className="gh-year-prompt">Select Year:</span>
        <div className="gh-year-tabs">
          {years.map((yr) => (
            <button
              type="button"
              key={yr}
              className={`gh-year-btn ${selectedYear === yr ? 'is-active' : ''}`}
              onClick={() => setSelectedYear(yr)}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
