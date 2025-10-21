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
export const listShops = async (params) => {
 const res = await api.get("/admin/listShops", { params });
  return res.data; // ⚠️ rất quan trọng
};
export const updateShop = (shopId, data) => {
  // data = { name: "Tên mới", status: "ACTIVE" }
  return api.put(`/admin/updateShop/${shopId}`, data);
}