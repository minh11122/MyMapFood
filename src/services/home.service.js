import api from "../lib/axios";

// Lấy danh sách cửa hàng gần vị trí (lat, lng) nhất đinh (3000m)
export const getNearbyShops = (lat, lng) => {
    return api.get("home/nearby", { params: { lat, lng } });
};