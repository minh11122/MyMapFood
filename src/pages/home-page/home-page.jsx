import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Crosshair, Star, Heart, Clock } from "lucide-react";
import Gemini_Generated_Image_lf325vlf325vlf32 from "../../assets/Gemini_Generated_Image_lf325vlf325vlf32.png";
import { getShopsWithTopFood } from "../../services/shop.service";

const foodCategories = [
  { id: 1, name: "Đồ uống", slug: "do-uong", image: "/img-home/drinks.jpg", color: "from-blue-400 to-blue-600" },
  { id: 2, name: "Thức Ăn", slug: "do-an", image: "/img-home/fast-food.jpg", color: "from-yellow-400 to-yellow-600" },
];

export const HomePage = () => {
  const [favorites, setFavorites] = useState([]);
  const [address, setAddress] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Lấy danh sách shop + món ăn top
  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        const res = await getShopsWithTopFood();
        if (res.data.success) {
          const formattedData = res.data.data.map((shop) => {
            const topFood = shop.topFood; // món đầu tiên của shop
            return {
              shopId: shop._id,
              shopName: shop.name,
              image: shop.img,
              rating: topFood?.rating || 4.5,
              reviews: 0,
              address: shop.address
                ? `${shop.address.street}, ${shop.address.ward}, ${shop.address.district}`
                : "Chưa có địa chỉ",
              isPromo: topFood?.discount > 0,
              discount: topFood?.discount || 0,
              category: topFood?.category || "Khác", // sửa ở đây
              deliveryTime: "20-30 phút",
            };
          });
          setRestaurants(formattedData);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách quán:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  const handleGetLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
              { headers: { "User-Agent": "MyApp/1.0 (your-email@example.com)" } }
            );
            const data = await response.json();
            if (data.address) {
              const a = data.address;
              const formattedAddress = [
                a.house_number, a.road, a.neighbourhood, a.suburb, a.village,
                a.town, a.city_district, a.city, a.state, a.country,
              ].filter(Boolean).join(", ");
              setAddress(formattedAddress || `Lat: ${lat}, Lng: ${lon}`);
            } else setAddress(`Lat: ${lat}, Lng: ${lon}`);
          } catch (err) {
            console.error(err);
            alert("Không thể lấy địa chỉ!");
          }
        },
        (err) => alert("Không lấy được vị trí: " + err.message)
      );
    } else alert("Trình duyệt không hỗ trợ định vị!");
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="w-full px-6 py-24 flex justify-center items-center bg-cover bg-center"
        style={{ backgroundImage: `url(${Gemini_Generated_Image_lf325vlf325vlf32})` }}>
        <div className="max-w-2xl text-center space-y-8">
          <h1 className="text-5xl font-bold text-white leading-tight">
            Giao hàng nhanh, <span className="text-yellow-500">mọi lúc!</span>
          </h1>
          <p className="text-lg text-white leading-relaxed">
            Đặt món ăn yêu thích từ các nhà hàng tốt nhất trong thành phố. Giao hàng nhanh chóng, đảm bảo chất lượng.
          </p>
          <div className="flex items-center justify-center w-full border border-yellow-400 rounded-lg px-3 py-2 bg-white shadow-sm max-w-md mx-auto">
            <MapPin className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Nhập địa chỉ của bạn"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1 px-2 py-1 outline-none text-gray-700"
            />
            <button onClick={handleGetLocation}>
              <Crosshair className="w-5 h-5 text-gray-500 hover:text-yellow-500" />
            </button>
          </div>
        </div>
      </section>

      {/* Food Categories */}
      <section className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Bộ sưu tập món ăn</h2>
        <div className="grid grid-cols-2 gap-4">
          {foodCategories.map((category) => (
            <Link key={category.id} to={`/menu/list/${category.slug}`}
              className="relative overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300 rounded-lg bg-white border border-yellow-200">
              <div className="aspect-[3/2] relative">
                <img src={category.image || "/placeholder.svg"} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-60`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-xl font-bold text-center px-4">{category.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Restaurants */}
      <section className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quán ngon hot</h2>
        {loading ? (
          <div className="text-center py-12"><p className="text-gray-500">Đang tải dữ liệu...</p></div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-12"><p className="text-gray-500">Chưa có quán nào</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {restaurants.map((shop) => (
              <div key={shop.shopId}
                onClick={() => navigate(`/shops/${shop.shopId}`)}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 group rounded-lg bg-white border border-yellow-200 cursor-pointer">
                <div className="relative">
                  <img src={shop.image} alt={shop.shopName} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                  {shop.isPromo && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">
                        GIẢM {shop.discount}%
                      </span>
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(shop.shopId); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(shop.shopId) ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-sm">{shop.shopName}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{shop.rating}</span>
                      <span className="text-xs text-gray-500">({shop.reviews})</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-1">{shop.address}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{shop.deliveryTime}</span>
                    </div>
                    <span className="text-yellow-600 font-medium">{shop.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
