const handleResponse = async (res) => {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.message || "요청 처리 중 오류가 발생했습니다.");
  }
  return body;
};

export default handleResponse;