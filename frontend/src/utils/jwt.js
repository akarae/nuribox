// JWT payload를 라이브러리 없이 디코딩 (서명 검증은 백엔드가 하니 여기선 role 읽기용)
export const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
};