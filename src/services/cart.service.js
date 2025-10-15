import api from "../lib/axios";

// 🛒 Thêm món vào giỏ hàng
export const addToCart = async (data) => {
  return await api.post("/cart/add", data);
};

// 🧺 Lấy giỏ hàng của 1 user trong 1 shop
export const getCartByShop = async (userId, shopId) => {
  return await api.get(`/cart/user/${userId}/shop/${shopId}`);
};

// ♻️ Cập nhật số lượng hoặc ghi chú món trong giỏ
export const updateCartItem = async (cartItemId, data) => {
  return await api.put(`/cart/${cartItemId}`, data);
};

// ❌ Xóa 1 món khỏi giỏ hàng
export const removeCartItem = async (cartItemId) => {
  return await api.delete(`/cart/${cartItemId}`);
};

// 🧺 Lấy giỏ hàng của user (gom theo shop)
export const getCartByUser = async (userId) => {
  return await api.get(`/cart/user/${userId}`)
}

export const getVouchersByShop = async (shopId) => {
  return await api.get(`/cart/vouchers/${shopId}`)
}