import React, { useEffect, useMemo, useState } from "react";
import { getWeekMenu, saveMenu, getMenuRange } from "../api/menuApi";
import { getCodes } from "../api/codeApi";
import { useToast } from "../context/ToastContext";

const WEEKDAYS = ["월", "화", "수", "목", "금"];

const formatDateLocal = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getMondayOfCurrentWeek = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 1 : 1 - day; // 일요일이면 다음날(다음주 월요일)로
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return formatDateLocal(monday);
};

const getWeekDates = (mondayDate) => {
  const monday = new Date(mondayDate);
  return WEEKDAYS.map((_, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    return formatDateLocal(d);
  });
};

const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateLocal(d);
};

const getWeekLabelForMonday = (mondayStr) => {
  const d = new Date(mondayStr);
  const m = d.getMonth() + 1;
  const w = Math.ceil(d.getDate() / 7);
  return `${m}월 ${w}주차`;
};

const MenuPage = () => {
  const showToast = useToast();
  const [mondayDate, setMondayDate] = useState(getMondayOfCurrentWeek());
  const [mealType, setMealType] = useState("L");
  const [mealTypes, setMealTypes] = useState([]);
  const [prcsType, setPrcsType] = useState("");
  const [prcsTypes, setPrcsTypes] = useState([]);
  const [menus, setMenus] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentMenus, setRecentMenus] = useState([]);

  const weekInfo = useMemo(() => {
    const d = new Date(mondayDate);
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      week: Math.ceil(d.getDate() / 7),
    };
  }, [mondayDate]);

  const weekDates = getWeekDates(mondayDate);

  const recentWeeks = useMemo(() => {
    return [0, 1, 2, 3, 4].map((i) => {
      const weekMonday = addDays(mondayDate, -7 * i);
      return {
        monday: weekMonday,
        label: getWeekLabelForMonday(weekMonday),
        dates: getWeekDates(weekMonday),
      };
    });
  }, [mondayDate]);

  const loadRecentMenus = () => {
    setRecentLoading(true);
    const rangeStart = addDays(mondayDate, -28);
    const rangeEnd = addDays(mondayDate, 4);
    return getMenuRange(rangeStart, rangeEnd)
      .then(setRecentMenus)
      .catch((err) => showToast(err.message))
      .finally(() => setRecentLoading(false));
  };

  useEffect(() => {
    loadRecentMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mondayDate]);

  const loadMenus = () =>
    getWeekMenu(weekInfo.year, weekInfo.month, weekInfo.week)
      .then(setMenus)
      .catch((err) => showToast(err.message));

  useEffect(() => {
    loadMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mondayDate]);

  useEffect(() => {
    getCodes("MEAL_TYPE").then(setMealTypes).catch((err) => showToast(err.message));
    getCodes("PRCS_TYPE")
      .then((codes) => {
        setPrcsTypes(codes);
        const defaultCode = codes.find((c) => c.code_value === "R") || codes[0];
        if (defaultCode) setPrcsType(defaultCode.code_value);
      })
      .catch((err) => showToast(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const initial = {};
    weekDates.forEach((date) => {
      const menu = menus.find((m) => m.menu_date === date && m.meal_type === mealType);
      initial[date] = menu?.menu_text || "";
    });
    setDrafts(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menus, mealType, mondayDate]);

  useEffect(() => {
    setRecentLoading(true);
    const rangeStart = addDays(mondayDate, -28);
    const rangeEnd = addDays(mondayDate, 4);
    getMenuRange(rangeStart, rangeEnd)
      .then(setRecentMenus)
      .catch((err) => showToast(err.message))
      .finally(() => setRecentLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mondayDate]);

  const handleMondayChange = (e) => {
    const value = e.target.value;
    if (!value) return;
    const d = new Date(value);
    if (d.getDay() !== 1) {
      showToast("월요일만 선택할 수 있습니다.");
      return;
    }
    setMondayDate(value);
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("메뉴가 복사되었습니다. 원하는 요일에 붙여넣어주세요.");
    } catch (err) {
      showToast("복사에 실패했습니다.");
    }
  };

  const handleSaveAll = async () => {
    const targets = WEEKDAYS.map((day, idx) => ({
      day,
      date: weekDates[idx],
      text: (drafts[weekDates[idx]] || "").trim(),
    })).filter((t) => t.text);

    if (targets.length === 0) {
      showToast("저장할 메뉴가 없습니다.");
      return;
    }

    try {
      await Promise.all(
        targets.map((t) =>
          saveMenu({
            menuDate: t.date,
            year: weekInfo.year,
            month: weekInfo.month,
            week: weekInfo.week,
            weekday: t.day,
            mealType,
            menuText: t.text,
            status: prcsType,
          })
        )
      );
      showToast(`${targets.length}개 요일의 식단이 저장되었습니다.`);
      loadMenus();
      loadRecentMenus();
    } catch (err) {
      showToast(err.message);
    }
  };

  return (
    <div>
      <h2>식단관리</h2>

      <div className="filter-row menu-filter-row">
        <div className="field-group">
          <label>연도</label>
          <div className="readonly-field">{weekInfo.year}</div>
        </div>
        <div className="field-group">
          <label>월</label>
          <div className="readonly-field">{weekInfo.month}</div>
        </div>
        <div className="field-group">
          <label>주</label>
          <div className="readonly-field">{weekInfo.week}</div>
        </div>
        <div className="field-group">
          <label>월요일 날짜</label>
          <input type="date" value={mondayDate} onChange={handleMondayChange} />
        </div>
        <div className="field-group">
          <label>식사구분</label>
          <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
            {mealTypes.map((code) => (
              <option key={code.code_id} value={code.code_value}>
                {code.code_name}
              </option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label>처리상태</label>
          <select value={prcsType} onChange={(e) => setPrcsType(e.target.value)}>
            {prcsTypes.map((code) => (
              <option key={code.code_id} value={code.code_value}>
                {code.code_name}
              </option>
            ))}
          </select>
        </div>
        <div className="field-group field-button">
          <label>&nbsp;</label>
          <button className="btn-primary" onClick={handleSaveAll}>저장</button>
        </div>
      </div>

      <div className="menu-grid">
        {WEEKDAYS.map((day, idx) => {
          const date = weekDates[idx];
          return (
            <div key={day} className="menu-cell">
              <h3>
                <span>
                  {day} ({date})
                </span>
                {(() => {
                  const menu = menus.find((m) => m.menu_date === date && m.meal_type === mealType);
                  if (!menu) return null;
                  const code = prcsTypes.find((c) => c.code_value === menu.status);
                  return (
                    <span className={`menu-status-badge menu-status-${menu.status}`}>
                      {code ? code.code_name : menu.status}
                    </span>
                  );
                })()}
              </h3>
              <textarea
                value={drafts[date] || ""}
                onChange={(e) => setDrafts({ ...drafts, [date]: e.target.value })}
              />
            </div>
          );
        })}
      </div>

      <div className="menu-history-section">
        <h3 className="menu-history-title">최근 5주간 식단표</h3>
        {recentLoading ? (
          <p>조회 중...</p>
        ) : (
          recentWeeks.map((week) => (
            <div key={week.monday} className="menu-history-week">
              <div className="menu-history-week-label">{week.label}</div>
              <div className="menu-grid">
                {WEEKDAYS.map((day, dayIdx) => {
                  const date = week.dates[dayIdx];
                  const menu = recentMenus.find((m) => m.menu_date === date && m.meal_type === mealType);
                  return (
                    <div key={date} className="menu-cell menu-history-cell">
                      <h3>
                        <span>
                          {day} ({date})
                        </span>
                        {menu?.menu_text && (
                          <button
                            className="menu-history-copy-btn"
                            onClick={() => handleCopy(menu.menu_text)}
                          >
                            복사
                          </button>
                        )}
                      </h3>
                      <div className="menu-history-text">{menu?.menu_text || "-"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MenuPage;