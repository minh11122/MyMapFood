import api from "../lib/axios";

// Lấy danh sách tất cả quán
export const getAllShops = () => {
  return api.get("/shops");
};

// Lấy chi tiết 1 quán theo id
export const getShopById = (id) => {
  return api.get(`/shops/${id}`);
};

// Thêm quán mới (chỉ admin)
export const createShop = (data) => {
  return api.post("/shops", data);
};

// Cập nhật thông tin quán
export const updateShop = (id, data) => {
  return api.put(`/shops/${id}`, data);
};

// Xóa quán
export const deleteShop = (id) => {
  return api.delete(`/shops/${id}`);
};

export const getShopsWithTopFood = () => {
  return api.get("/shops/top-food"); // backend endpoint
};

export const getFoodsByShopId = (shopId) => {
  return api.get(`/shops/${shopId}`);
};

// export const getAllShops = (params) => {
//   return api.get("/shops", { params });
// };

export const getAllCategories = () => {
  return api.get("/shops/food/categories");
};

export const getFoodsByType = (type) => {
  return api.get(`/type/${type}`);
};
