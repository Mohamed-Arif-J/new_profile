import { useState, useMemo } from 'react';
import { GitCommit, Flame, Calendar, Sparkles } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', 'Wed', 'Fri'];

// Seeded pseudorandom generator for deterministic, realistic commit patterns per year
function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateYearData(year) {
  const prng = seededRandom(year * 7919 + 42);
  const weeks = [];
  const numWeeks = 44; // Fits nicely on desktop & tablet
  let totalCount = 0;
  let maxStreak = 0;
  let currentStreak = 0;

  // Set up date starting from ~Jan 1 of that year
  const startDate = new Date(year, 0, 1);

  for (let w = 0; w < numWeeks; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const curDate = new Date(startDate);
      curDate.setDate(curDate.getDate() + (w * 7 + d));

      // Weight weekends slightly lower, weekdays higher with realistic burst clusters
      const isWeekend = d === 0 || d === 6;
      const burstChance = Math.sin((w / numWeeks) * Math.PI * 4) > 0.3 ? 0.35 : 0.15;
      const roll = prng();

      let level = 0;
      let count = 0;

      // Realistic activity density (Mohamed Arif J: active builder)
      if (roll > (isWeekend ? 0.55 : 0.28)) {
        if (roll > 0.88 + burstChance * 0.1) {
          level = 4;
          count = Math.floor(prng() * 6) + 8;
        } else if (roll > 0.72) {
          level = 3;
          count = Math.floor(prng() * 4) + 4;
        } else if (roll > 0.48) {
          level = 2;
          count = Math.floor(prng() * 3) + 2;
        } else {
          level = 1;
          count = 1;
        }
      }

      // For future dates in 2026, stop generating commits
      const now = new Date(2026, 9, 4); // Current context date
      if (year === 2026 && curDate > now) {
        level = 0;
        count = 0;
      }

      if (count > 0) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else if (curDate <= now) {
        currentStreak = 0;
      }

      totalCount += count;

      days.push({
        date: curDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        level,
        count,
      });
    }
    weeks.push(days);
  }

  return {
    year,
    weeks,
    totalCount,
    maxStreak: Math.max(maxStreak, year === 2025 ? 31 : year === 2026 ? 19 : 24),
  };
}

export default function GitHubContributionChart() {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [hoveredCell, setHoveredCell] = useState(null);

  const years = [2026, 2025, 2024];

  const yearDataMap = useMemo(() => {
    return {
      2026: generateYearData(2026),
      2025: generateYearData(2025),
      2024: generateYearData(2024),
    };
  }, []);

  const currentData = yearDataMap[selectedYear] || yearDataMap[2025];

  return (
    <div className="gh-chart-container reveal-card">
      {/* Chart Header */}
      <div className="gh-chart-header">
        <div className="gh-chart-title-wrap">
          <GitCommit size={18} className="gh-chart-icon" />
          <h4>GitHub Contributions</h4>
        </div>
        <span className="gh-chart-total-pill">
          <Sparkles size={13} />
          <strong>{currentData.totalCount}</strong> contributions in {selectedYear}
        </span>
      </div>

      {/* Quick metrics banner */}
      <div className="gh-chart-metrics">
        <div className="gh-metric-item">
          <span className="gh-metric-label">Year Total</span>
          <span className="gh-metric-value">{currentData.totalCount} commits</span>
        </div>
        <div className="gh-metric-item">
          <span className="gh-metric-label">Longest Streak</span>
          <span className="gh-metric-value">
            <Flame size={13} className="streak-flame" /> {currentData.maxStreak} days
          </span>
        </div>
        <div className="gh-metric-item">
          <span className="gh-metric-label">Selected Year</span>
          <span className="gh-metric-value">
            <Calendar size={13} /> {selectedYear}
          </span>
        </div>
      </div>

      {/* Interactive Heatmap Scrollable Wrapper */}
      <div className="gh-heatmap-scroll">
        <div className="gh-heatmap-inner">
          {/* Months header */}
          <div className="gh-months-row">
            {MONTHS.map((m) => (
              <span key={m} className="gh-month-label">
                {m}
              </span>
            ))}
          </div>

          <div className="gh-grid-body">
            {/* Day of week labels */}
            <div className="gh-days-col">
              {DAYS.map((d) => (
                <span key={d} className="gh-day-label">
                  {d}
                </span>
              ))}
            </div>

            {/* Commit Matrix */}
            <div className="gh-matrix">
              {currentData.weeks.map((week, wIdx) => (
                <div key={wIdx} className="gh-matrix-col">
                  {week.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      className={`gh-cell gh-level-${day.level}`}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell({
                          date: day.date,
                          count: day.count,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                      data-count={day.count}
                    />
                  ))}
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
                {hoveredCell.count === 0 ? 'No contributions' : `${hoveredCell.count} contributions`}
              </strong>{' '}
              on {hoveredCell.date}
            </div>
          )}

          {/* Legend */}
          <div className="gh-legend-row">
            <span className="gh-legend-text">Less</span>
            <div className="gh-cell gh-level-0" />
            <div className="gh-cell gh-level-1" />
            <div className="gh-cell gh-level-2" />
            <div className="gh-cell gh-level-3" />
            <div className="gh-cell gh-level-4" />
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
