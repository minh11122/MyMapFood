import api from "../lib/axios";

export const listFood = (params) => {
  
  return api.get("/foods", { params });
};

export const getFoodsByShopId = (shopId) => {
  return api.get(`/foods/shop/${shopId}`);
};

export const searchShopsAndFoods = (query) => {
  return api.get("/search", { params: { query } });
};

// Lấy danh sách yêu thích của 1 user
export const getFavourites = (userId) => {
  return api.get(`/favourites/${userId}`);
};

// Thêm món ăn vào yêu thích
export const addFavourite = (userId, foodId) => {
  return api.post(`/favourites`, { userId, foodId });
};

// Xóa món ăn khỏi yêu thích
export const removeFavourite = (userId, foodId) => {
  return api.delete(`/favourites`, { data: { userId, foodId } });
};
