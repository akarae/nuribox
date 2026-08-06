import React, { useState } from "react";

const ChangePasswordModal = ({ onClose, onSubmit }) => {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");

  const handleSubmit = () => {
    onSubmit({ currentPw, newPw });
  };

  return (
    <div className="modal">
      <h2>비밀번호 변경</h2>
      <input
        type="password"
        placeholder="현재 비밀번호"
        value={currentPw}
        onChange={(e) => setCurrentPw(e.target.value)}
      />
      <input
        type="password"
        placeholder="새 비밀번호"
        value={newPw}
        onChange={(e) => setNewPw(e.target.value)}
      />
      <button onClick={handleSubmit}>변경</button>
      <button onClick={onClose}>취소</button>
    </div>
  );
};

export default ChangePasswordModal;
