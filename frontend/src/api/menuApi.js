import fetchWithAuth from "./fetchWithAuth";
import handleResponse from "./handleResponse";
const API_URL = process.env.REACT_APP_API_URL;

export const getWeekMenu = (year, month, week) =>
  fetchWithAuth(`${API_URL}/menus?year=${year}&month=${month}&week=${week}`).then(handleResponse);

export const saveMenu = (data) =>
  fetchWithAuth(`${API_URL}/menus`, { method: "POST", body: JSON.stringify(data) }).then(handleResponse);

export const deleteMenu = (menuId) =>
  fetchWithAuth(`${API_URL}/menus/${menuId}`, { method: "DELETE" }).then(handleResponse);

export const getMenuRange = (startDate, endDate) =>
  fetchWithAuth(`${API_URL}/menus/range?startDate=${startDate}&endDate=${endDate}`).then(handleResponse);