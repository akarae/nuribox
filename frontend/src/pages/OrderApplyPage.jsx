import React, { useEffect, useState } from "react";
import { getMyOrders, saveOrder } from "../api/orderApi";
import { getMenuRange } from "../api/menuApi";
import { getCodes } from "../api/codeApi";
import { getMyCompany } from "../api/companyApi";
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

const getWeekLabel = (mondayDateStr) => {
  const d = new Date(mondayDateStr);
  const month = d.getMonth() + 1;
  const weekOfMonth = Math.ceil(d.getDate() / 7);
  return `${month}월 ${weekOfMonth}주차`;
};

const OrderApplyPage = () => {
  const showToast = useToast();
  const [mondayDate, setMondayDate] = useState(getMondayOfCurrentWeek());
  const [mealType, setMealType] = useState("L");
  const [mealTypes, setMealTypes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menus, setMenus] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [companyName, setCompanyName] = useState("");

  const weekDates = getWeekDates(mondayDate);

  const visibleDays = WEEKDAYS.map((day, idx) => {
    const date = weekDates[idx];
    const menu = menus.find((m) => m.menu_date === date && m.meal_type === mealType);
    return { day, date, menu };
  }).filter((d) => d.menu);

  const loadOrders = () =>
    getMyOrders(weekDates[0], weekDates[4]).then(setOrders).catch((err) => showToast(err.message));

  useEffect(() => {
    getMyCompany().then((c) => setCompanyName(c.company_name)).catch((err) => showToast(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToast]);

  useEffect(() => {
    loadOrders();
    getMenuRange(weekDates[0], weekDates[4]).then(setMenus).catch((err) => showToast(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mondayDate, showToast]);

  useEffect(() => {
    getCodes("MEAL_TYPE").then(setMealTypes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToast]);

  useEffect(() => {
    const initial = {};
    visibleDays.forEach(({ date }) => {
      const order = orders.find((o) => o.menu_date === date && o.meal_type === mealType);
      initial[date] = order ? String(order.order_count) : "0";
    });
    setDrafts(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, menus, mealType, mondayDate]);

  const isValidCount = (value) => value !== "" && Number.isInteger(Number(value)) && Number(value) >= 0;

  const handleSaveAll = async () => {
    if (visibleDays.length === 0) {
      showToast("현재 신청 가능한 식단이 없습니다.");
      return;
    }
    const invalid = visibleDays.find((d) => !isValidCount(drafts[d.date]));
    if (invalid) {
      showToast("모든 요일에 0 이상의 숫자를 입력해주세요.");
      return;
    }
    try {
      await Promise.all(
        visibleDays.map((d) => saveOrder({ menuDate: d.date, mealType, orderCount: Number(drafts[d.date]) }))
      );
      showToast("식수 신청이 저장되었습니다.");
      loadOrders();
    } catch (err) {
      showToast(err.message);
    }
  };

  return (
    <div>
      <div className="order-apply-banner" />

      <div className="order-apply-hero">
        <h2>{companyName} 주간식단표 및 식수신청</h2>
      </div>

      <div className="order-apply-week-row">
        <span className="badge badge-green">대상기간 : {getWeekLabel(mondayDate)}</span>
      </div>

      <div className="filter-row" style={{ display: "none" }}>
        <div className="field-group">
          <label>월요일 날짜</label>
          <input type="date" value={mondayDate} onChange={(e) => setMondayDate(e.target.value)} />
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
      </div>

      {visibleDays.length === 0 ? (
        <p style={{ textAlign: "center", margin: "2rem 0" }}>현재 신청 가능한 식단이 없습니다.</p>
      ) : (
        <div className="menu-grid">
          {visibleDays.map(({ day, date, menu }) => (
            <div key={day} className="menu-cell">
              <h3>
                {day} ({date})
              </h3>
              <div className="order-menu-preview">{menu.menu_text}</div>
              <div className="order-count-row">
                <span className="order-count-label">수량</span>
                <input
                  type="number"
                  min="0"
                  value={drafts[date] ?? "0"}
                  onChange={(e) => setDrafts({ ...drafts, [date]: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="order-apply-save-row">
        <button className="btn-primary" onClick={handleSaveAll}>식수 저장하기</button>
      </div>

      <div className="order-apply-footer">
        선생님들의 건강을 위해 정성껏 준비하겠습니다.
        <br />
        맛있게 드시고 오늘도 힘내세요! — 누리도시락 올림
      </div>
      <div className="order-apply-banner order-apply-banner-bottom" />
    </div>
  );
};

export default OrderApplyPage;