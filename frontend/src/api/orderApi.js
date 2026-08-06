import fetchWithAuth from "./fetchWithAuth";
import handleResponse from "./handleResponse";
const API_URL = process.env.REACT_APP_API_URL;

export const getMyOrders = (startDate, endDate) =>
  fetchWithAuth(`${API_URL}/orders/my?startDate=${startDate}&endDate=${endDate}`).then(handleResponse);
export const saveOrder = (data) =>
  fetchWithAuth(`${API_URL}/orders/my`, { method: "POST", body: JSON.stringify(data) }).then(handleResponse);
export const getAllOrders = (startDate, endDate) =>
  fetchWithAuth(`${API_URL}/orders/all?startDate=${startDate}&endDate=${endDate}`).then(handleResponse);
export const getStats = (year, month) =>
  fetchWithAuth(`${API_URL}/orders/stats?year=${year}&month=${month}`).then(handleResponse);