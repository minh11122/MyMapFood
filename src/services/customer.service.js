import api from "../lib/axios";

// 🟢 Lấy profile đầy đủ (account + user + address)
export const getUserProfile = async (userId) => {
  try {
    const res = await api.get(`/customer/${userId}/profile`);
    return res.data.profile; // Trả về profile
  } catch (error) {
    console.error("Lỗi khi lấy thông tin profile:", error);
    throw error;
  }
};
