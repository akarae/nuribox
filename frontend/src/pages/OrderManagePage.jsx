import React, { useEffect, useState, useMemo } from "react";
import { getAllOrders } from "../api/orderApi";
import { getMenuRange } from "../api/menuApi";
import { getCodes } from "../api/codeApi";
import { getCompanies } from "../api/companyApi";
import { useToast } from "../context/ToastContext";

const WEEKDAYS = ["월", "화", "수", "목", "금"];

const getWeekDates = (mondayDate) => {
  const monday = new Date(mondayDate);
  return WEEKDAYS.map((_, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    return d.toISOString().slice(0, 10);
  });
};

const OrderManagePage = () => {
  const [mondayDate, setMondayDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [mealType, setMealType] = useState("L");
  const [mealTypes, setMealTypes] = useState([]);
  const [menus, setMenus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const weekDates = useMemo(() => getWeekDates(mondayDate), [mondayDate]);
  const showToast = useToast();

  useEffect(() => {
    getMenuRange(weekDates[0], weekDates[4]).then(setMenus).catch((err) => showToast(err.message));
    getAllOrders(weekDates[0], weekDates[4]).then(setOrders).catch((err) => showToast(err.message));
  }, [weekDates, showToast]);

  useEffect(() => {
    getCodes("MEAL_TYPE").then(setMealTypes);
    getCompanies().then(setCompanies).catch((err) => showToast(err.message));
  }, [showToast]);

  const findMenuText = (date) =>
    menus.find((m) => m.menu_date === date && m.meal_type === mealType)?.menu_text;

  const findOrderCount = (companyId, date) =>
    orders.find(
      (o) => o.company_id === companyId && o.menu_date === date && o.meal_type === mealType
    )?.order_count || 0;

  const columnTotal = (date) =>
    companies.reduce((sum, c) => sum + findOrderCount(c.company_id, date), 0);

  return (
    <div>
      <h2>식수관리</h2>

      <div className="filter-row">
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

      <table className="order-manage-table">
        <thead>
          <tr>
            <th>식단</th>
            {WEEKDAYS.map((day, idx) => (
              <th key={day}>
                <div className="order-table-weekday">
                  {day} ({weekDates[idx]})
                </div>
                <div className="order-table-menu-card">
                  {findMenuText(weekDates[idx]) || "등록된 식단이 없습니다."}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => (
            <tr key={c.company_id}>
              <td>{c.company_name}</td>
              {weekDates.map((date) => (
                <td key={date}>{findOrderCount(c.company_id, date)}</td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>합계 (제조수량)</td>
            {weekDates.map((date) => (
              <td key={date}>{columnTotal(date)}</td>
            ))}
          </tr>
        </tfoot>
      </table>
      <div className="no-print" style={{ marginTop: "1rem", textAlign: "right" }}>
        <button className="btn-primary" onClick={() => window.print()}>출력</button>
      </div>
    </div>
  );
};

export default OrderManagePage;