import api from "../lib/axios";

// Lấy thông tin profile theo account_id
export const getProfile = (accountId) => {
  return api.get(`/auth/profile/${accountId}`);
};

// Cập nhật thông tin profile
export const updateProfile = (accountId, data) => {
  return api.patch(`/auth/profile/${accountId}`, data);
};
