import { refreshAccessToken } from "./authApi";

// 공통 인증 fetch wrapper (401 시 토큰 자동 갱신)
const fetchWithAuth = async (url, options = {}) => {
  let accessToken = localStorage.getItem("accessToken");

  const doFetch = (token) =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

  let res = await doFetch(accessToken);

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      localStorage.setItem("accessToken", newToken);
      res = await doFetch(newToken);
    }
  }

  return res;
};

export default fetchWithAuth;
