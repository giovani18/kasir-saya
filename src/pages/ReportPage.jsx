import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../stores/AppContext';
import { formatRupiah } from '../utils/format';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  BarChart2,
  ShoppingBag,
  Receipt,
} from 'lucide-react';
import './ReportPage.css';

/* ─── helpers ─── */
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function addMonths(d, n) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

const FILTER_OPTIONS = [
  { value: 'hari_ini', label: 'Hari Ini' },
  { value: '7hari', label: 'Mingguan (7 Hari)' },
  { value: '30hari', label: '30 Hari Terakhir' },
  { value: 'bulanan', label: 'Bulanan (1 Tahun)' },
];

/* ─── component ─── */
export const ReportPage = () => {
  const { transactions } = useApp();
  const [filter, setFilter] = useState('7hari');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── date ranges for current & previous period ── */
  const { currentStart, currentEnd, prevStart, prevEnd } = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = addDays(todayStart, 1);

    if (filter === 'hari_ini') {
      const prevS = addDays(todayStart, -1);
      const prevE = todayStart;
      return { currentStart: todayStart, currentEnd: todayEnd, prevStart: prevS, prevEnd: prevE };
    }
    if (filter === '7hari') {
      const curS = addDays(todayStart, -6);
      const prevS = addDays(curS, -7);
      return { currentStart: curS, currentEnd: todayEnd, prevStart: prevS, prevEnd: curS };
    }
    if (filter === '30hari') {
      const curS = addDays(todayStart, -29);
      const prevS = addDays(curS, -30);
      return { currentStart: curS, currentEnd: todayEnd, prevStart: prevS, prevEnd: curS };
    }
    // bulanan: last 12 months vs previous 12
    const curS = addMonths(new Date(todayStart.getFullYear(), todayStart.getMonth(), 1), -11);
    const prevS = addMonths(curS, -12);
    return { currentStart: curS, currentEnd: todayEnd, prevStart: prevS, prevEnd: curS };
  }, [filter]);

  /* ── filtered transactions ── */
  const currentTxs = useMemo(
    () =>
      transactions.filter(
        (tx) => tx.timestamp >= currentStart.getTime() && tx.timestamp < currentEnd.getTime()
      ),
    [transactions, currentStart, currentEnd]
  );
  const prevTxs = useMemo(
    () =>
      transactions.filter(
        (tx) => tx.timestamp >= prevStart.getTime() && tx.timestamp < prevEnd.getTime()
      ),
    [transactions, prevStart, prevEnd]
  );

  /* ── summary cards ── */
  const { revenue, txCount, avgTx, revPerc, countPerc, avgPerc } = useMemo(() => {
    const revenue = currentTxs.reduce((s, tx) => s + tx.total, 0);
    const txCount = currentTxs.length;
    const avgTx = txCount > 0 ? Math.round(revenue / txCount) : 0;

    const prevRevenue = prevTxs.reduce((s, tx) => s + tx.total, 0);
    const prevCount = prevTxs.length;
    const prevAvg = prevCount > 0 ? Math.round(prevRevenue / prevCount) : 0;

    const perc = (cur, prev) => {
      if (prev === 0) return cur > 0 ? 100 : 0;
      return Math.round(((cur - prev) / prev) * 100);
    };

    return {
      revenue,
      txCount,
      avgTx,
      revPerc: perc(revenue, prevRevenue),
      countPerc: perc(txCount, prevCount),
      avgPerc: perc(avgTx, prevAvg),
    };
  }, [currentTxs, prevTxs]);

  /* ── chart data ── */
  const chartData = useMemo(() => {
    const data = [];
    if (filter === 'bulanan') {
      for (let i = 11; i >= 0; i--) {
        const s = addMonths(
          new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          -i
        );
        const e = addMonths(s, 1);
        const val = transactions
          .filter((tx) => tx.timestamp >= s.getTime() && tx.timestamp < e.getTime())
          .reduce((sum, tx) => sum + tx.total, 0);
        data.push({
          label: s.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
          value: val,
        });
      }
    } else {
      const days =
        filter === 'hari_ini' ? 1 : filter === '7hari' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const s = startOfDay(addDays(new Date(), -i));
        const e = addDays(s, 1);
        const val = transactions
          .filter((tx) => tx.timestamp >= s.getTime() && tx.timestamp < e.getTime())
          .reduce((sum, tx) => sum + tx.total, 0);
        data.push({
          label: s.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          value: val,
        });
      }
    }
    return data;
  }, [transactions, filter]);

  const maxChartVal = Math.max(...chartData.map((d) => d.value), 1000);

  /* ── top 5 products ── */
  const top5 = useMemo(() => {
    const map = {};
    currentTxs.forEach((tx) => {
      (tx.items || []).forEach((item) => {
        if (!map[item.name]) {
          map[item.name] = { name: item.name, qty: 0, total: 0 };
        }
        map[item.name].qty += item.qty;
        map[item.name].total += item.price * item.qty;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [currentTxs]);

  /* ── y-axis labels ── */
  const yAxisLabels = useMemo(() => {
    const steps = 4;
    const labels = [];
    for (let i = steps; i >= 0; i--) {
      const val = (maxChartVal / steps) * i;
      if (val >= 1_000_000) labels.push(`${(val / 1_000_000).toFixed(0)}JT`);
      else if (val >= 1_000) labels.push(`${(val / 1_000).toFixed(0)}RB`);
      else labels.push(`${val.toFixed(0)}`);
    }
    return labels;
  }, [maxChartVal]);

  /* ── label helpers ── */
  const filterLabel = FILTER_OPTIONS.find((o) => o.value === filter)?.label ?? '';
  const periodLabel =
    filter === 'hari_ini'
      ? 'Hari Ini'
      : filter === '7hari'
      ? 'Minggu Ini'
      : filter === '30hari'
      ? '30 Hari Ini'
      : 'Tahun Ini';
  const prevPeriodLabel =
    filter === 'hari_ini'
      ? 'kemarin'
      : filter === '7hari'
      ? 'minggu lalu'
      : filter === '30hari'
      ? '30 hari lalu'
      : 'tahun lalu';

  /* ── badge component ── */
  const Badge = ({ val }) => {
    if (val === 0)
      return (
        <span className="rp-badge rp-badge-neutral">
          <Minus size={12} /> Stabil
        </span>
      );
    const up = val > 0;
    return (
      <span className={`rp-badge ${up ? 'rp-badge-up' : 'rp-badge-down'}`}>
        {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {up ? '+' : ''}{val}% dari {prevPeriodLabel}
      </span>
    );
  };

  /* ── tooltip formatter ── */
  const fmt = (v) => {
    if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(1)}jt`;
    if (v >= 1_000) return `Rp ${(v / 1_000).toFixed(0)}rb`;
    return formatRupiah(v);
  };

  const rankColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="rp-container">
      {/* ── Header ── */}
      <div className="rp-header">
        <h2 className="rp-title">Laporan Penjualan</h2>
        <div className="rp-filter-wrapper" ref={dropdownRef}>
          <button
            className="rp-filter-btn"
            onClick={() => setDropdownOpen((p) => !p)}
          >
            {filterLabel}
            <ChevronDown size={16} className={`rp-chevron ${dropdownOpen ? 'open' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="rp-dropdown">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`rp-dropdown-item ${filter === opt.value ? 'active' : ''}`}
                  onClick={() => {
                    setFilter(opt.value);
                    setDropdownOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="rp-cards">
        {/* Pendapatan */}
        <div className="rp-card">
          <div className="rp-card-icon rp-icon-green">
            <BarChart2 size={22} />
          </div>
          <div className="rp-card-body">
            <p className="rp-card-label">Pendapatan {periodLabel}</p>
            <p className="rp-card-value">{formatRupiah(revenue)}</p>
            <Badge val={revPerc} />
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="rp-card">
          <div className="rp-card-icon rp-icon-blue">
            <Receipt size={22} />
          </div>
          <div className="rp-card-body">
            <p className="rp-card-label">Total Transaksi {periodLabel}</p>
            <p className="rp-card-value">{txCount} Transaksi</p>
            <Badge val={countPerc} />
          </div>
        </div>

        {/* Rata-rata Transaksi */}
        <div className="rp-card">
          <div className="rp-card-icon rp-icon-gray">
            <ShoppingBag size={22} />
          </div>
          <div className="rp-card-body">
            <p className="rp-card-label">Rata-rata Transaksi</p>
            <p className="rp-card-value">{formatRupiah(avgTx)}</p>
            <Badge val={avgPerc} />
          </div>
        </div>
      </div>

      {/* ── Bottom section: Chart + Top5 ── */}
      <div className="rp-bottom">
        {/* Chart */}
        <div className="rp-chart-card">
          <h3 className="rp-section-title">Grafik Tren Pendapatan</h3>
          <div className="rp-chart-area">
            {/* Y-axis */}
            <div className="rp-y-axis">
              {yAxisLabels.map((l, i) => (
                <span key={i} className="rp-y-label">{l}</span>
              ))}
            </div>
            {/* Bars */}
            <div className="rp-bars-wrapper">
              <div className="rp-grid-lines">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="rp-grid-line" />
                ))}
              </div>
              <div className="rp-bars">
                {chartData.map((d, i) => (
                  <div key={i} className="rp-bar-group">
                    <div className="rp-bar-track">
                      <div
                        className="rp-bar"
                        style={{ height: `${(d.value / maxChartVal) * 100}%` }}
                      >
                        {d.value > 0 && (
                          <span className="rp-bar-tip">{fmt(d.value)}</span>
                        )}
                      </div>
                    </div>
                    <span className="rp-bar-label">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 */}
        <div className="rp-top5-card">
          <h3 className="rp-section-title">Top 5 Produk Terlaris</h3>
          {top5.length === 0 ? (
            <p className="rp-empty">Belum ada data transaksi pada periode ini.</p>
          ) : (
            <ol className="rp-top5-list">
              {top5.map((item, i) => (
                <li key={i} className="rp-top5-item">
                  <span
                    className="rp-rank"
                    style={{ background: rankColors[i] }}
                  >
                    {i + 1}
                  </span>
                  <div className="rp-top5-info">
                    <span className="rp-top5-name">{item.name}</span>
                    <span className="rp-top5-qty">{item.qty} porsi</span>
                  </div>
                  <span className="rp-top5-total">
                    Rp {item.total >= 1000
                      ? `${(item.total / 1000).toFixed(0)}k`
                      : item.total}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
};
