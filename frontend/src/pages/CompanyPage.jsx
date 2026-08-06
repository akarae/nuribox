import React, { useEffect, useState } from "react";
import { getCompanies, createCompany, updateCompany, createAccount, getAccount, updateAccountPassword } from "../api/companyApi";
import { getCodes } from "../api/codeApi";
import { useToast } from "../context/ToastContext";

const emptyForm = {
  company_name: "",
  business_type: "",
  manager_name: "",
  phone: "",
  address: "",
  payment_day: "",
  status: "거래중",
  note: "",
};

const CompanyPage = () => {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [accountForm, setAccountForm] = useState(null);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [businessTypes, setBusinessTypes] = useState([]);
  const [statusTypes, setStatusTypes] = useState([]);
  const showToast = useToast();

  const loadCompanies = () => getCompanies().then(setCompanies);

useEffect(() => {
  loadCompanies();
  getCodes("BUSI_TYPE").then(setBusinessTypes);
  getCodes("STAT_TYPE").then(setStatusTypes);
}, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setEditingId(c.company_id);
    setForm({
      company_name: c.company_name,
      business_type: c.business_type || "",
      manager_name: c.manager_name || "",
      phone: c.phone || "",
      address: c.address || "",
      payment_day: c.payment_day || "",
      status: c.status,
      note: c.note || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async () => {
    if (!form.company_name) {
      showToast("업체명은 필수입니다.");
      return;
    }
    try {
      if (editingId) {
        await updateCompany(editingId, form);
      } else {
        await createCompany(form);
      }
      closeModal();
      loadCompanies();
    } catch (err) {
      showToast(err.message);
    }
  };

const openAccountModal = async (companyId, companyCode, companyName, e) => {
    e.stopPropagation();
    try {
      const result = await getAccount(companyId);
      setAccountForm({
        companyId,
        companyName,
        existingUserId: result.exists ? result.userId : null,
      });
      setLoginId("user");
      setPassword("");
      setPasswordConfirm("");
    } catch (err) {
      showToast(err.message);
    }
  };

const handleCreateAccount = async () => {
  if (!password || !passwordConfirm) {
    showToast("비밀번호를 입력해주세요.");
    return;
  }
  if (password !== passwordConfirm) {
    showToast("비밀번호가 일치하지 않습니다.");
    return;
  }
  try {
    if (accountForm.existingUserId) {
      await updateAccountPassword(accountForm.existingUserId, password);
      showToast(`${accountForm.companyName} 비밀번호가 변경되었습니다.`);
    } else {
      await createAccount({ companyId: accountForm.companyId, loginId, password });
      showToast(`${accountForm.companyName} 계정이 발급되었습니다. (아이디: ${loginId})`);
    }
    setAccountForm(null);
    setPassword("");
    setPasswordConfirm("");
  } catch (err) {
    showToast(err.message);
  }
};

const copyUrl = (companyCode) => {
  const url = `https://nuribox.co.kr/?c=${companyCode}`;
  navigator.clipboard.writeText(url);
  showToast("접속 URL이 복사되었습니다.");
};

  return (
    <div>
      <h2>업체관리</h2>

      <table>
        <thead>
          <tr>
            <th>업체코드</th>
            <th>업체명</th>
            <th>담당자</th>
            <th>전화번호</th>
            <th>결제일</th>
            <th>거래상태</th>
            <th>접속URL</th>
            <th>계정관리</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => (
            <tr key={c.company_id} onClick={() => openEditModal(c)} style={{ cursor: "pointer" }}>
              <td>{c.company_code}</td>
              <td>{c.company_name}</td>
              <td>{c.manager_name}</td>
              <td>{c.phone}</td>
              <td>{c.payment_day}</td>
              <td>{c.status}</td>
              <td className="table-actions" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => copyUrl(c.company_code)}>복사</button>
              </td>
              <td className="table-actions" onClick={(e) => e.stopPropagation()}>
                <button onClick={(e) => openAccountModal(c.company_id, c.company_code, c.company_name, e)}>계정관리</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn-primary" style={{ marginTop: 12 }} onClick={openCreateModal}>
        새 업체 등록
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <h2>{editingId ? "업체 수정" : "업체 등록"}</h2>
            <div className="form-grid">
              <input name="company_name" placeholder="업체명" value={form.company_name} onChange={handleChange} />
              <select name="business_type" value={form.business_type} onChange={handleChange}>
                <option value="">업종 선택</option>
                {businessTypes.map((code) => (
                  <option key={code.code_id} value={code.code_value}>
                    {code.code_name}
                  </option>
                ))}
              </select>
              <input name="manager_name" placeholder="담당자" value={form.manager_name} onChange={handleChange} />
              <input name="phone" placeholder="전화번호" value={form.phone} onChange={handleChange} />
              <input
                name="payment_day"
                type="number"
                min="1"
                max="31"
                placeholder="결제일"
                value={form.payment_day}
                onChange={handleChange}
              />
              <select name="status" value={form.status} onChange={handleChange}>
                {statusTypes.map((code) => (
                  <option key={code.code_id} value={code.code_value}>
                    {code.code_name}
                  </option>
                ))}
              </select>
              <input name="address" placeholder="주소" value={form.address} onChange={handleChange} style={{ gridColumn: "1 / -1" }} />
              <textarea
                name="note"
                placeholder="비고"
                value={form.note}
                onChange={handleChange}
                style={{ gridColumn: "1 / -1" }}
              />
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={handleSubmit}>{editingId ? "수정 저장" : "등록"}</button>
              <button onClick={closeModal}>취소</button>
            </div>
          </div>
        </div>
      )}

      {accountForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>계정 관리 - {accountForm.companyName}</h2>
            <input value={loginId} readOnly disabled />
            <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input type="password" placeholder="비밀번호 확인" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
            <div className="form-actions">
              <button className="btn-primary" onClick={handleCreateAccount}>
                {accountForm.existingUserId ? "비밀번호 변경" : "발급"}
              </button>
              <button onClick={() => setAccountForm(null)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyPage;