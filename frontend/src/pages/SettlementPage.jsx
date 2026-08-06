import React, { useEffect, useState } from "react";
import { getSettlements, confirmSettlement, markPaid, previewOrderCount } from "../api/settlementApi";
import { useToast } from "../context/ToastContext";

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - i);

const SettlementPage = () => {
  const showToast = useToast();
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(null);

  const loadSettlements = () =>
    getSettlements(year, month).then(setRows).catch((err) => showToast(err.message));

  useEffect(() => {
    loadSettlements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const summary = rows.reduce(
    (acc, r) => {
      if (r.settlement_id) {
        acc.confirmedCount += 1;
        acc.totalAmount += r.total_amount || 0;
        if (r.paid_yn === "Y") acc.paidCount += 1;
      }
      return acc;
    },
    { confirmedCount: 0, totalAmount: 0, paidCount: 0 }
  );

  const openConfirmModal = async (row) => {
    setModal({
      companyId: row.company_id,
      companyName: row.company_name,
      applyPrice: row.apply_price || 0,
      totalCount: row.total_count ?? null,
      loading: true,
    });
    try {
      const { totalCount } = await previewOrderCount(row.company_id, year, month);
      setModal((prev) => (prev ? { ...prev, totalCount, loading: false } : prev));
    } catch (err) {
      showToast(err.message);
      setModal((prev) => (prev ? { ...prev, loading: false } : prev));
    }
  };

  const closeModal = () => setModal(null);

  const handleConfirm = async () => {
    if (!modal) return;
    try {
      await confirmSettlement({
        companyId: modal.companyId,
        year,
        month,
        applyPrice: Number(modal.applyPrice),
      });
      showToast("정산이 확정되었습니다.");
      closeModal();
      loadSettlements();
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleMarkPaid = async (settlementId) => {
    try {
      await markPaid(settlementId);
      showToast("입금 확인 처리되었습니다.");
      loadSettlements();
    } catch (err) {
      showToast(err.message);
    }
  };

  return (
    <div>
      <h2>정산관리</h2>

      <div className="filter-row">
        <div className="field-group">
          <label>연도</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label>월</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>
        </div>
        <div className="field-group field-button">
          <label>&nbsp;</label>
          <button className="btn-primary" onClick={loadSettlements}>조회</button>
        </div>
      </div>

      <div className="stat-summary-row">
        <div className="stat-summary-card">
          <div className="stat-summary-label">확정된 업체</div>
          <div className="stat-summary-value">{summary.confirmedCount} / {rows.length}개</div>
        </div>
        <div className="stat-summary-card">
          <div className="stat-summary-label">총 청구금액</div>
          <div className="stat-summary-value">{summary.totalAmount.toLocaleString()}원</div>
        </div>
        <div className="stat-summary-card">
          <div className="stat-summary-label">입금완료</div>
          <div className="stat-summary-value">{summary.paidCount} / {summary.confirmedCount}개</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>업체명</th>
            <th style={{ textAlign: "right" }}>총 식수</th>
            <th style={{ textAlign: "right" }}>적용단가</th>
            <th style={{ textAlign: "right" }}>청구금액</th>
            <th style={{ textAlign: "center" }}>상태</th>
            <th style={{ textAlign: "center" }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>업체가 없습니다.</td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.company_id}>
                <td>{r.company_name}</td>
                <td style={{ textAlign: "right" }}>{r.settlement_id ? `${r.total_count}식` : "-"}</td>
                <td style={{ textAlign: "right" }}>{r.settlement_id ? `${r.apply_price?.toLocaleString()}원` : "-"}</td>
                <td style={{ textAlign: "right" }}>{r.settlement_id ? `${r.total_amount?.toLocaleString()}원` : "-"}</td>
                <td style={{ textAlign: "center" }}>
                  {!r.settlement_id ? (
                    <span className="badge badge-gray">미확정</span>
                  ) : r.paid_yn === "Y" ? (
                    <span className="badge badge-green">입금완료</span>
                  ) : (
                    <span className="badge badge-yellow">확정/미입금</span>
                  )}
                </td>
                <td style={{ textAlign: "center" }}>
                  {!r.settlement_id ? (
                    <button onClick={() => openConfirmModal(r)}>정산확정</button>
                  ) : r.paid_yn !== "Y" ? (
                    <>
                      <button onClick={() => openConfirmModal(r)}>수정</button>{" "}
                      <button className="btn-primary" onClick={() => handleMarkPaid(r.settlement_id)}>입금확인</button>
                    </>
                  ) : (
                    <button onClick={() => openConfirmModal(r)}>수정</button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{modal.companyName} 정산 확정</h2>
            <p>
              {year}년 {month}월 총 식수: {modal.loading ? "조회 중..." : `${modal.totalCount ?? 0}식`}
            </p>
            <input
              type="number"
              min="0"
              placeholder="적용단가"
              value={modal.applyPrice}
              onChange={(e) => setModal({ ...modal, applyPrice: e.target.value })}
            />
            <p>
              청구금액: {((modal.totalCount || 0) * Number(modal.applyPrice || 0)).toLocaleString()}원
            </p>
            <button className="btn-primary" onClick={handleConfirm} disabled={modal.loading}>확정</button>{" "}
            <button onClick={closeModal}>취소</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettlementPage;