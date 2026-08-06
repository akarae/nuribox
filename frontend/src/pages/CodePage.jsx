import React, { useEffect, useState } from "react";
import { getCodes, getGroups, createCode, updateCode, deleteCode } from "../api/codeApi";
import { useToast } from "../context/ToastContext";

const CodePage = () => {
  const showToast = useToast();
  const [groups, setGroups] = useState([]);
  const [groupCode, setGroupCode] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [customGroup, setCustomGroup] = useState("");
  const [codes, setCodes] = useState([]);
  const [modal, setModal] = useState(null);

  const activeGroup = customMode ? customGroup.trim() : groupCode;

  useEffect(() => {
    getGroups()
      .then((list) => {
        setGroups(list);
        if (list.length > 0) setGroupCode(list[0]);
      })
      .catch((err) => showToast(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCodes = () => {
    if (!activeGroup) {
      setCodes([]);
      return;
    }
    getCodes(activeGroup).then(setCodes).catch((err) => showToast(err.message));
  };

  useEffect(() => {
    loadCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroup]);

  const openCreateModal = () => {
    if (!activeGroup) {
      showToast("그룹코드를 먼저 선택하거나 입력해주세요.");
      return;
    }
    setModal({ mode: "create", codeId: null, codeValue: "", codeName: "", sortOrder: codes.length + 1 });
  };

  const openEditModal = (code) => {
    setModal({
      mode: "edit",
      codeId: code.code_id,
      codeValue: code.code_value,
      codeName: code.code_name,
      sortOrder: code.sort_order ?? 1,
    });
  };

  const closeModal = () => setModal(null);

  const refreshGroups = () =>
    getGroups()
      .then(setGroups)
      .catch((err) => showToast(err.message));

  const handleSaveModal = async () => {
    if (!modal.codeValue.trim() || !modal.codeName.trim()) {
      showToast("코드값과 코드명을 입력해주세요.");
      return;
    }
    try {
      const payload = {
        group_code: activeGroup,
        code_value: modal.codeValue.trim(),
        code_name: modal.codeName.trim(),
        sort_order: Number(modal.sortOrder) || 1,
      };
      if (modal.mode === "create") {
        await createCode(payload);
        showToast("코드가 등록되었습니다.");
      } else {
        await updateCode(modal.codeId, payload);
        showToast("코드가 수정되었습니다.");
      }
      closeModal();
      loadCodes();
      refreshGroups();
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm(`"${code.code_name}" 코드를 삭제할까요?`)) return;
    try {
      await deleteCode(code.code_id);
      showToast("코드가 삭제되었습니다.");
      loadCodes();
      refreshGroups();
    } catch (err) {
      showToast(err.message);
    }
  };

  return (
    <div>
      <h2>공통코드 관리</h2>

      <div className="filter-row">
        <div className="field-group">
          <label>그룹코드</label>
          {customMode ? (
            <input
              placeholder="새 그룹코드 입력 (예: NEW_GROUP)"
              value={customGroup}
              onChange={(e) => setCustomGroup(e.target.value.toUpperCase())}
            />
          ) : (
            <select value={groupCode} onChange={(e) => setGroupCode(e.target.value)}>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="field-group field-button">
          <label>&nbsp;</label>
          <button
            onClick={() => {
              setCustomMode((prev) => !prev);
              setCustomGroup("");
            }}
          >
            {customMode ? "목록에서 선택" : "새 그룹 만들기"}
          </button>
        </div>
        <div className="field-group field-button">
          <label>&nbsp;</label>
          <button className="btn-primary" onClick={openCreateModal}>새 코드 추가</button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>코드값</th>
            <th>코드명</th>
            <th style={{ textAlign: "center" }}>정렬순서</th>
            <th style={{ textAlign: "center" }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {codes.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center" }}>등록된 코드가 없습니다.</td>
            </tr>
          ) : (
            codes.map((code) => (
              <tr key={code.code_id}>
                <td>{code.code_value}</td>
                <td>{code.code_name}</td>
                <td style={{ textAlign: "center" }}>{code.sort_order}</td>
                <td style={{ textAlign: "center" }}>
                  <button onClick={() => openEditModal(code)}>수정</button>{" "}
                  <button onClick={() => handleDelete(code)}>삭제</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              {modal.mode === "create" ? "코드 추가" : "코드 수정"} ({activeGroup})
            </h2>
            <input
              placeholder="코드값 (예: R)"
              value={modal.codeValue}
              onChange={(e) => setModal({ ...modal, codeValue: e.target.value })}
            />
            <input
              placeholder="코드명 (예: 준비중)"
              value={modal.codeName}
              onChange={(e) => setModal({ ...modal, codeName: e.target.value })}
            />
            <input
              type="number"
              placeholder="정렬순서"
              value={modal.sortOrder}
              onChange={(e) => setModal({ ...modal, sortOrder: e.target.value })}
            />
            <button className="btn-primary" onClick={handleSaveModal}>저장</button>{" "}
            <button onClick={closeModal}>취소</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodePage;