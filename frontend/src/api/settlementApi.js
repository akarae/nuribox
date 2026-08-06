import fetchWithAuth from "./fetchWithAuth";
import handleResponse from "./handleResponse";
const API_URL = process.env.REACT_APP_API_URL;

export const getSettlements = (year, month) =>
  fetchWithAuth(`${API_URL}/settlements?year=${year}&month=${month}`).then(handleResponse);
export const confirmSettlement = (data) =>
  fetchWithAuth(`${API_URL}/settlements/confirm`, { method: "POST", body: JSON.stringify(data) }).then(handleResponse);
export const markPaid = (settlementId) =>
  fetchWithAuth(`${API_URL}/settlements/${settlementId}/paid`, { method: "PATCH" }).then(handleResponse);