import api from "../lib/axios";

/** 🏪 Lấy thông tin quán theo ownerId */
export const getShopProfile = (ownerId) => {
  return api.get(`/owner/${ownerId}/shop`);
};

/** 🏪 Cập nhật thông tin quán (tên, mô tả, ảnh, địa chỉ, v.v.) */
export const updateShopProfile = (ownerId, data) => {
  return api.put(`/owner/${ownerId}/shop`, data);
};

/** 🍜 Lấy danh sách món ăn của quán */
export const getFoodsByOwner = (ownerId) => {
  return api.get(`/owner/${ownerId}/foods`);
};

/** ✏️ Cập nhật món ăn */
export const updateFood = (foodId, data) => {
  return api.put(`/owner/food/${foodId}`, data);
};

/** 💰 Lấy thống kê tài chính của quán */
export const getFinanceByOwner = (ownerId) => {
  return api.get(`/owner/${ownerId}/finance`);
};

export const getRevenueByShop = (ownerId, month, year) => {
  return api.get(`/owner/${ownerId}/revenue`, {
    params: { month, year },
  });
}