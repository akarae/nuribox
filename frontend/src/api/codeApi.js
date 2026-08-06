import fetchWithAuth from "./fetchWithAuth";
import handleResponse from "./handleResponse";
const API_URL = process.env.REACT_APP_API_URL;

export const getCodes = (groupCode) => fetchWithAuth(`${API_URL}/codes/${groupCode}`).then(handleResponse);

export const createCode = (data) =>
  fetchWithAuth(`${API_URL}/codes`, { method: "POST", body: JSON.stringify(data) }).then(handleResponse);

export const updateCode = (codeId, data) =>
  fetchWithAuth(`${API_URL}/codes/${codeId}`, { method: "PUT", body: JSON.stringify(data) }).then(handleResponse);

export const deleteCode = (codeId) =>
  fetchWithAuth(`${API_URL}/codes/${codeId}`, { method: "DELETE" }).then(handleResponse);

export const getGroups = () => fetchWithAuth(`${API_URL}/codes/groups`).then(handleResponse);