import api from "../lib/axios";

// Lấy danh sách tài khoản (có phân trang, filter)
export const listAccounts = (params) => {
  // params = { search, role, status, page }
  return api.get("/admin/accounts", { params });
};

// Cập nhật trạng thái tài khoản
export const updateAccountStatus = (accountId) => {
  return api.patch(`/admin/accounts/${accountId}`);
};
