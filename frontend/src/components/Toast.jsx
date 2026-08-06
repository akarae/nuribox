import React, { useEffect } from "react";

// 화면 중앙 토스트 알림 컴포넌트
const Toast = ({ message, onClose, duration = 2000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="toast">
      <span>{message}</span>
    </div>
  );
};

export default Toast;
