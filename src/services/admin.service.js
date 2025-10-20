import api from "../lib/axios";

// Lấy danh sách tài khoản (phân trang + filter)
export const listAccounts = (params) => {
  // params có thể chứa: { search, role, status, page }
  return api.get("/admin/listAccount", { params });
};

export const updateAccountAndUser = (accountId, data) => {
  // data = { full_name: "Tên mới", status: "ACTIVE" }
  return api.put(`/admin/updateAccount/${accountId}`, data);
};