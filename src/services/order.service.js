import api from "../lib/axios";

export const createOrder = (orderData) => {
  return api.post("/orders/create", orderData);
}
export const getOrders = () => {
  return api.get("/orders/history");
};

export const cancelOrder = (orderId, cancelReason) => {
  return api.post(`/orders/cancel/${orderId}`, { cancelReason });
}
