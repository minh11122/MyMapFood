import api from "../lib/axios";

export const createOrder = (orderData) => {
  return api.post("/orders/create", orderData);
}
export const getOrders = (userId) => {
  return api.get(`/orders/history?userId=${userId}`);
};

export const cancelOrder = (orderId, cancelReason) => {
  return api.post(`/orders/cancel/${orderId}`, { cancelReason });
}
