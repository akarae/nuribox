import React, { useEffect, useState } from "react";
import { getStatistics } from "../api/statisticsApi";
import { getCompanies } from "../api/companyApi";
import { getCodes } from "../api/codeApi";
import { useToast } from "../context/ToastContext";

const GROUP_OPTIONS = [
  { value: "year", label: "연도별" },
  { value: "month", label: "월별" },
  { value: "company", label: "업체별" },
  { value: "mealType", label: "식사구분별" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - i);

const StatisticsPage = () => {
  const showToast = useToast();
  const [groupBy, setGroupBy] = useState("month");
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [mealType, setMealType] = useState("");
  const [companies, setCompanies] = useState([]);
  const [mealTypes, setMealTypes] = useState([]);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [drilldown, setDrilldown] = useState(null); // { title, rows, loading, subGroupBy }

  useEffect(() => {
    getCompanies().then(setCompanies).catch((err) => showToast(err.message));
    getCodes("MEAL_TYPE").then(setMealTypes).catch((err) => showToast(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToast]);

  const handleSearch = async () => {
    try {
      const { rows, summary } = await getStatistics({
        year: year || undefined,
        month: month || undefined,
        companyId: companyId || undefined,
        mealType: mealType || undefined,
        groupBy,
      });
      setRows(rows);
      setSummary(summary);
    } catch (err) {
      showToast(err.message);
    }
  };

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    setGroupBy("month");
    setYear(String(currentYear));
    setMonth("");
    setCompanyId("");
    setMealType("");
  };

  const mealTypeLabel = (value) => mealTypes.find((m) => m.code_value === value)?.code_name || value;

  const renderLabel = (row) => {
    switch (groupBy) {
      case "year": return `${row.period}년`;
      case "month": return `${row.year}년 ${row.month}월`;
      case "company": return row.company_name;
      case "mealType": return mealTypeLabel(row.meal_type);
      default: return "";
    }
  };

  const renderSubLabel = (row, subGroupBy) => {
    switch (subGroupBy) {
      case "month": return `${row.year}년 ${row.month}월`;
      case "company": return row.company_name;
      default: return "";
    }
  };

  const clickable = groupBy === "year" || groupBy === "month";

  const handleRowClick = async (row) => {
    if (groupBy === "year") {
      const title = `${row.period}년 월별 통계`;
      setDrilldown({ title, rows: [], loading: true, subGroupBy: "month" });
      try {
        const { rows: subRows } = await getStatistics({ year: row.period, groupBy: "month" });
        setDrilldown({ title, rows: subRows, loading: false, subGroupBy: "month" });
      } catch (err) {
        showToast(err.message);
        setDrilldown(null);
      }
    } else if (groupBy === "month") {
      const title = `${row.year}년 ${row.month}월 업체별 통계`;
      setDrilldown({ title, rows: [], loading: true, subGroupBy: "company" });
      try {
        const { rows: subRows } = await getStatistics({ year: row.year, month: row.month, groupBy: "company" });
        setDrilldown({ title, rows: subRows, loading: false, subGroupBy: "company" });
      } catch (err) {
        showToast(err.message);
        setDrilldown(null);
      }
    }
  };

  const closeDrilldown = () => setDrilldown(null);

  return (
    <div>
      <h2>통계관리</h2>

      <div className="filter-row">
        <div className="field-group">
          <label>조회기준</label>
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            {GROUP_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label>연도</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">전체</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label>월</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="">전체</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label>업체</label>
          <select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
            <option value="">전체</option>
            {companies.map((c) => (
              <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label>식사구분</label>
          <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
            <option value="">전체</option>
            {mealTypes.map((code) => (
              <option key={code.code_id} value={code.code_value}>{code.code_name}</option>
            ))}
          </select>
        </div>
        <div className="field-group field-button">
          <label>&nbsp;</label>
          <button className="btn-primary" onClick={handleSearch}>조회</button>
        </div>
        <div className="field-group field-button">
          <label>&nbsp;</label>
          <button onClick={handleReset}>초기화</button>
        </div>
      </div>

      {summary && (
        <div className="stat-summary-row">
          <div className="stat-summary-card">
            <div className="stat-summary-label">총 식수</div>
            <div className="stat-summary-value">{summary.total_count || 0}식</div>
          </div>
          <div className="stat-summary-card">
            <div className="stat-summary-label">주문 업체 수</div>
            <div className="stat-summary-value">{summary.company_count || 0}개</div>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>구분</th>
            <th style={{ textAlign: "right" }}>총 식수</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={2} style={{ textAlign: "center" }}>조회된 데이터가 없습니다.</td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={idx}
                onClick={clickable ? () => handleRowClick(row) : undefined}
                className={clickable ? "stat-row-clickable" : ""}
              >
                <td>{renderLabel(row)}</td>
                <td style={{ textAlign: "right" }}>{row.total_count}식</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {drilldown && (
        <div className="modal-overlay" onClick={closeDrilldown}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{drilldown.title}</h2>
            {drilldown.loading ? (
              <p>조회 중...</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>구분</th>
                    <th style={{ textAlign: "right" }}>총 식수</th>
                  </tr>
                </thead>
                <tbody>
                  {drilldown.rows.length === 0 ? (
                    <tr>
                      <td colSpan={2} style={{ textAlign: "center" }}>데이터가 없습니다.</td>
                    </tr>
                  ) : (
                    drilldown.rows.map((row, idx) => (
                      <tr key={idx}>
                        <td>{renderSubLabel(row, drilldown.subGroupBy)}</td>
                        <td style={{ textAlign: "right" }}>{row.total_count}식</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
            <div className="modal-close-row">
              <button onClick={closeDrilldown}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPage;