import fetchWithAuth from "./fetchWithAuth";
import handleResponse from "./handleResponse";
const API_URL = process.env.REACT_APP_API_URL;

export const getStatistics = ({ year, month, companyId, mealType, groupBy }) => {
  const params = new URLSearchParams();
  if (year) params.append("year", year);
  if (month) params.append("month", month);
  if (companyId) params.append("companyId", companyId);
  if (mealType) params.append("mealType", mealType);
  params.append("groupBy", groupBy);
  return fetchWithAuth(`${API_URL}/statistics?${params.toString()}`).then(handleResponse);
};

export const previewOrderCount = (companyId, year, month) =>
  fetchWithAuth(`${API_URL}/settlements/preview?companyId=${companyId}&year=${year}&month=${month}`).then(handleResponse);