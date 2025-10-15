import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { login, loginGoogle } from "@/services/auth.service";
import { GoogleLogin } from "@react-oauth/google";
import Cookies from "js-cookie";
import z7061145888588_5c8d81483fa297d0582373ac66f727a4 from "../../assets/z7061145888588_5c8d81483fa297d0582373ac66f727a4.jpg";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Lấy email đã lưu trong cookie (nếu có)
  const savedEmail = Cookies.get("rememberedEmail") || "";

  // Validation Schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Email không hợp lệ")
      .required("Vui lòng nhập email"),
    password: Yup.string()
      .min(6, "Mật khẩu tối thiểu 6 ký tự")
      .required("Vui lòng nhập mật khẩu"),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      email: savedEmail, // nạp email từ cookie
      password: "",
      rememberMe: !!savedEmail, // nếu có cookie thì tick sẵn
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const res = await login(values);
        toast.success("Đăng nhập thành công!");

        // Lưu token/ thông tin user vào localStorage
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userRole", res.data.user.role); // thêm dòng này
        localStorage.setItem("user", JSON.stringify(res.data.user));


        // Xử lý Remember Me
        if (values.rememberMe) {
          Cookies.set("rememberedEmail", values.email, { expires: 7 }); // lưu 7 ngày
        } else {
          Cookies.remove("rememberedEmail");
        }

        const role = res.data.user.role; // lấy role từ API

        if (role === "ADMIN") {
          navigate("/admin/list-acc");
        } else if (role === "MANAGER_STAFF") {
          navigate("/manager/list-food");
        } else if (role === "SELLER_STAFF") {
          navigate("/staff/list-order");
        } else {
          navigate("/"); // CUSTOMER hoặc mặc định
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Đăng nhập thất bại");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Xử lý Google Login
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const tokenId = credentialResponse.credential;
      const res = await loginGoogle(tokenId);
      toast.success("Đăng nhập Google thành công!");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userRole", res.data.user.role); // thêm dòng này
      localStorage.setItem("user", JSON.stringify(res.data.user));


      const role = res.data.user.role; // lấy role từ API

      if (role === "ADMIN") {
        navigate("/admin/list-acc");
      } else if (role === "MANAGER_STAFF") {
        navigate("/manager/list-food");
      } else if (role === "SELLER_STAFF") {
        navigate("/staff/list-order");
      } else {
        navigate("/"); // CUSTOMER hoặc mặc định
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng nhập Google thất bại");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 px-4">
      {/* Logo + Brand */}
      <Link to="/" className="flex items-center gap-2">
        <img
          src={z7061145888588_5c8d81483fa297d0582373ac66f727a4}
          alt="MyMapFood Logo"
          className="w-10 h-10 object-cover rounded-full"
        />
        <span className="text-2xl font-bold text-gray-900 transition-colors">
          My<span className="text-yellow-500">MapFood</span>
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center mb-1">Đăng nhập</h2>
        <p className="text-center text-gray-600 mb-8">
          Chào mừng bạn trở lại với{" "}
          <span className="font-medium">MyMapFood</span>
        </p>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Nhập email của bạn"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="pl-10 border rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-sm">{formik.errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="pl-10 pr-10 border rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-sm">{formik.errors.password}</p>
            )}
          </div>

          {/* Remember me + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                id="rememberMe"
                type="checkbox"
                name="rememberMe"
                checked={formik.values.rememberMe}
                onChange={formik.handleChange}
                className="rounded"
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <a
              href="/auth/forgot-password"
              className="text-sm text-yellow-500 hover:underline"
            >
              Quên mật khẩu?
            </a>
          </div>

          {/* Login button */}
          <button
            type="submit"
            className="w-full bg-yellow-500 text-white font-medium rounded-lg px-4 py-2 hover:bg-yellow-600 disabled:opacity-70"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Hoặc</span>
            </div>
          </div>

          {/* Google login */}
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => toast.error("Đăng nhập Google thất bại")}
          />

          {/* Register link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <a
                href="/auth/register"
                className="text-yellow-500 hover:underline font-medium"
              >
                Đăng ký ngay
              </a>
            </p>
          </div>
        </form>

        <p className="mt-6 text-xs text-gray-500 text-center">
          Bằng cách tiếp tục, bạn đồng ý với{" "}
          <a href="/terms" className="text-yellow-500 hover:underline">
            Điều khoản dịch vụ
          </a>{" "}
          và{" "}
          <a href="/privacy" className="text-yellow-500 hover:underline">
            Chính sách bảo mật
          </a>{" "}
          của chúng tôi.
        </p>
      </div>
    </div>
  );
}
