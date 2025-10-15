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
