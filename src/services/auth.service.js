import api from "../lib/axios";

// Đăng ký bằng email/password
export const register = (data) => {
    return api.post("/auth/register", data);
};

// Xác thực OTP
export const verifyOtp = (data) => {
    return api.post("/auth/verify-otp", data);
};

// Đăng ký bằng Google
export const registerGoogle = (tokenId) => {
    return api.post("/auth/register/google", { tokenId });
};

// Quên mật khẩu (gửi mật khẩu tạm qua email)
export const forgotPassword = (email) => {
    return api.post("/auth/forgot-password", { email });
};

// Đăng nhập bằng email/password
export const login = (data) => {
    return api.post("/auth/login", data);
};

// Đăng nhập bằng Google
export const loginGoogle = (tokenId) => {
    return api.post("/auth/login/google", { tokenId });
};

// Gửi lại OTP
export const resendOtp = (email) => {
    return api.post("/auth/resend-otp", { email });
};