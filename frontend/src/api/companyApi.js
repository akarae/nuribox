import fetchWithAuth from "./fetchWithAuth";
import handleResponse from "./handleResponse";
const API_URL = process.env.REACT_APP_API_URL;

export const getCompanies = () => fetchWithAuth(`${API_URL}/companies`).then(handleResponse);

export const createCompany = (data) =>
  fetchWithAuth(`${API_URL}/companies`, { method: "POST", body: JSON.stringify(data) }).then(handleResponse);

export const updateCompany = (companyId, data) =>
  fetchWithAuth(`${API_URL}/companies/${companyId}`, { method: "PUT", body: JSON.stringify(data) }).then(handleResponse);

export const deleteCompany = (companyId) =>
  fetchWithAuth(`${API_URL}/companies/${companyId}`, { method: "DELETE" }).then(handleResponse);

export const createAccount = (data) =>
  fetchWithAuth(`${API_URL}/companies/account`, { method: "POST", body: JSON.stringify(data) }).then(handleResponse);

export const getAccount = (companyId) =>
  fetchWithAuth(`${API_URL}/companies/${companyId}/account`).then(handleResponse);

export const updateAccountPassword = (userId, password) =>
  fetchWithAuth(`${API_URL}/companies/account/${userId}`, { method: "PUT", body: JSON.stringify({ password }) }).then(handleResponse);

export const getMyCompany = () =>
  fetchWithAuth(`${API_URL}/companies/me`).then(handleResponse);