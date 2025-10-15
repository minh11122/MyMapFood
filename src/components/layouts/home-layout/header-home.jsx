import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  X,
  User,
  ChevronDown,
  Heart,
  Clock,
  LogOut,
} from "lucide-react";
import logo from "../../../assets/z7061145888588_5c8d81483fa297d0582373ac66f727a4.jpg";
import { searchShopsAndFoods } from "@/services/food.service";

export const HeaderHome = () => {
  const [openSearch, setOpenSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!token && !!user;
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setShowUserMenu(false);
    navigate("/");
    window.location.reload();
  };

  const handleLoginClick = () => {
    if (isLoggedIn) setShowUserMenu(!showUserMenu);
    else navigate("/auth/login");
  };

  const handleSearch = async (text) => {
    setQuery(text);
    if (!text) return setSuggestions([]);
    try {
      const res = await searchShopsAndFoods(text);
      if (res.data.success) setSuggestions(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const goToSearchPage = (text) => {
    navigate(`/search?query=${encodeURIComponent(text)}`);
    setOpenSearch(false);
  };

  const handleSelectSuggestion = (item) => {
    if (item.type === "shop") navigate(`/shops/${item.id}`);
    else if (item.type === "food") navigate(`/foods/${item.id}`);
    setOpenSearch(false);
  };

  return (
    <>
      <header className="w-full px-6 py-4 bg-white border-b border-yellow-200 shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-yellow-500 rounded-full flex items-center justify-center shadow-md overflow-hidden">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <Link to="/" className="text-2xl font-bold text-gray-900">
              MyMap<span className="text-yellow-500">Food</span>
            </Link>
          </div>

          {/* Search trigger */}
          <div
            onClick={() => setOpenSearch(true)}
            className="flex items-center gap-2 w-full max-w-md px-4 py-2 border border-yellow-300 rounded-full bg-white hover:shadow-md transition cursor-pointer"
          >
            <Search className="w-5 h-5 text-gray-500" />
            <span className="text-gray-500">Tìm món ăn hoặc nhà hàng</span>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={handleLoginClick}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-full shadow-md"
            >
              <User className="w-4 h-4" />
              <span>{isLoggedIn ? user?.name || "Tài khoản" : "Đăng nhập"}</span>
              {isLoggedIn && <ChevronDown className="w-4 h-4" />}
            </button>

            {isLoggedIn && showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <Link
                  to="/shops/profile"
                  className="w-full px-4 py-3 text-left text-sm hover:bg-yellow-50 flex items-center gap-3"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="w-5 h-5 text-yellow-500" /> Profile
                </Link>

                <Link
                  to="/shops/cart"
                  className="w-full px-4 py-3 text-left text-sm hover:bg-yellow-50 flex items-center gap-3"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Clock className="w-5 h-5 text-yellow-500" /> Giỏ hàng
                </Link>

                <Link
                  to="/shops/favorite"
                  className="w-full px-4 py-3 text-left text-sm hover:bg-yellow-50 flex items-center gap-3"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Heart className="w-5 h-5 text-yellow-500" /> Yêu thích
                </Link>

                <Link
                  to="/shops/history"
                  className="w-full px-4 py-3 text-left text-sm hover:bg-yellow-50 flex items-center gap-3"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Clock className="w-5 h-5 text-yellow-500" /> Lịch sử mua hàng
                </Link>

                <hr className="my-2" />

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-yellow-50 flex items-center gap-3"
                >
                  <LogOut className="w-5 h-5 text-yellow-500" /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Overlay Search */}
      {openSearch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-start pt-20 z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-4 relative">
            <button
              onClick={() => setOpenSearch(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 mb-4">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm món ăn hoặc nhà hàng"
                className="w-full outline-none"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && goToSearchPage(query)}
                autoFocus
              />
            </div>

            <div className="max-h-80 overflow-y-auto">
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectSuggestion(item)}
                  className="flex items-center gap-3 p-2 hover:bg-yellow-50 cursor-pointer rounded"
                >
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div>
                    <span className="text-gray-800">{item.name}</span>
                    <span className="text-xs text-gray-400 ml-1">{item.type === "shop" ? "Quán" : "Món"}</span>
                  </div>
                </div>
              ))}
              {query && suggestions.length === 0 && (
                <div className="p-2 text-gray-500">Không tìm thấy kết quả</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
