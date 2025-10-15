import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export const FooterHome = () => {
  return (
    <footer className="bg-white text-[#333] border-t border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">Y</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                MyMap<span className="text-yellow-500">Food</span>
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Giao hàng nhanh chóng, thức ăn tươi ngon. Đặt món yêu thích của bạn chỉ với vài cú click!
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-yellow-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-yellow-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-yellow-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-[#555] hover:text-[#333] transition-colors"
                >
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#555] hover:text-[#333] transition-colors"
                >
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#555] hover:text-[#333] transition-colors"
                >
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#555] hover:text-[#333] transition-colors"
                >
                  Hỗ trợ khách hàng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#555] hover:text-[#333] transition-colors"
                >
                  Trở thành đối tác
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-yellow-500" />
                <span className="text-[#555]">0983493222</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-yellow-500" />
                <span className="text-[#555]">support@MyMapFood.vn</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-yellow-500 mt-0.5" />
                <span className="text-[#555]">
                  Đại học FPT Hà Nội
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Nhận khuyến mãi</h4>
            <p className="text-[#555] text-sm mb-4">
              Đăng ký để nhận thông tin khuyến mãi và món ăn mới nhất
            </p>
            <div className="space-y-2">
              <input
                placeholder="Nhập email của bạn"
                className="w-full px-3 py-2 rounded bg-white border border-[#ddd] text-[#333] placeholder:text-[#888] focus:outline-none"
              />
              <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded transition-colors">
                Đăng ký
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#ddd] mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-[#777] text-sm">
            © 2025 MyMapFood. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-[#777] hover:text-[#333] text-sm transition-colors"
            >
              Chính sách Cookie
            </a>
            <a
              href="#"
              className="text-[#777] hover:text-[#333] text-sm transition-colors"
            >
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};