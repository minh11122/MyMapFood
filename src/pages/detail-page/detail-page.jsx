import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Star,
  Heart,
  User,
  Search,
  MapPin,
  Phone,
  X,
  ChevronLeft,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getShopById, getAllShops } from "../../services/shop.service";
import { addToCart } from "../../services/cart.service";

const openingHours = [
  { day: "Chủ nhật", time: "06:30 - 21:00", isToday: false },
  { day: "Thứ hai", time: "06:30 - 21:00", isToday: false },
  { day: "Thứ ba", time: "06:30 - 21:00", isToday: false },
  { day: "Thứ tư", time: "06:30 - 21:00", isToday: false },
  { day: "Thứ năm", time: "06:30 - 21:00", isToday: false },
  { day: "Thứ sáu", time: "06:30 - 21:00", isToday: false },
  { day: "Thứ bảy", time: "06:30 - 21:00", isToday: true },
];

export const DetailPage = () => {
  const { shopId } = useParams();
  const [liked, setLiked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [showSimilar, setShowSimilar] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [shop, setShop] = useState(null);
  const [foods, setFoods] = useState([]);
  const [similarShops, setSimilarShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [addedFoodName, setAddedFoodName] = useState("");
  const navigate = useNavigate();

  // Fetch shop data và foods
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getShopById(shopId);

        if (response.data.success && response.data.data) {
          const shopData = response.data.data;
          setShop(shopData);
          setFoods(shopData.foods || []);
        } else {
          setError("Không tìm thấy quán");
        }

        try {
          const allShopsResponse = await getAllShops();
          if (allShopsResponse.data.success) {
            const otherShops = allShopsResponse.data.data
              .filter((s) => s._id !== shopId)
              .slice(0, 4)
              .map((s) => ({
                _id: s._id,
                name: s.name,
                address: s.address
                  ? `${s.address.street}, ${s.address.ward}, ${s.address.district}`
                  : "Chưa có địa chỉ",
                distance: "1.0 km",
                rating: s.rating || 4.5,
                reviews: 100,
                img:
                  s.foods?.[0]?.image_url ||
                  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
                badge: "PROMO",
              }));
            setSimilarShops(otherShops);
          }
        } catch (err) {
          console.log("Không thể tải danh sách shop tương tự:", err);
        }
      } catch (err) {
        setError(err.message || "Có lỗi xảy ra");
        console.error("Error fetching shop data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (shopId) {
      fetchShopData();
    }
  }, [shopId]);

  // Xử lý thêm món vào giỏ hàng
  const handleAddToCart = async (food) => {
    try {
      setAddingToCart(food._id);

      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setShowLoginDialog(true);
        return;
      }
      const user = JSON.parse(userStr);
      const userId = user._id;
      if (!userId) {
        setShowLoginDialog(true);
        return;
      }

      const cartData = {
        userId: userId,
        shopId: shopId,
        foodId: food._id,
        quantity: 1,
        note: "Ít cay",
      };

      const response = await addToCart(cartData);

      if (response.data.success) {
        setAddedFoodName(food.name);
        setShowSuccessDialog(true);
      } else {
        console.error("Không thể thêm vào giỏ hàng!");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
    } finally {
      setAddingToCart(null);
    }
  };

  const categories = useMemo(() => {
    const allCategories = ["Tất cả"];
    const categoryCounts = { "Tất cả": foods.length };

    foods.forEach((food) => {
      const categoryName = food.category_id?.name || "Khác";
      if (!allCategories.includes(categoryName)) {
        allCategories.push(categoryName);
        categoryCounts[categoryName] = 1;
      } else {
        categoryCounts[categoryName]++;
      }
    });

    return allCategories.map((name) => ({
      name,
      count: categoryCounts[name] || 0,
    }));
  }, [foods]);

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const categoryName = food.category_id?.name || "Khác";
      const matchesCategory =
        selectedCategory === "Tất cả" || categoryName === selectedCategory;
      const matchesSearch =
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (food.description &&
          food.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const isAvailable = food.is_available !== false;
      return matchesCategory && matchesSearch && isAvailable;
    });
  }, [foods, selectedCategory, searchQuery]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            Đang tải thông tin quán...
          </p>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-4">
            {error || "Không thể tải thông tin quán"}
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const fullAddress = shop.address
    ? `${shop.address.street}, ${shop.address.ward}, ${shop.address.district}, ${shop.address.city}`
    : "Chưa có địa chỉ";

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50 min-h-screen pb-24">
      {/* Restaurant Header */}
      <Card className="border-0 shadow-md mx-auto max-w-7xl rounded-none sm:rounded-2xl sm:mt-4">
        <CardContent className="p-0">
          <div className="px-6 py-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-96 h-64 lg:h-56 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                <img
                  src={
                    shop.img
                  }
                  alt={shop.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                      {shop.name}
                    </CardTitle>
                  </div>
                  <Button
                    variant={liked ? "destructive" : "outline"}
                    size="sm"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300 ${
                      liked
                        ? "bg-yellow-50 border-yellow-400 text-yellow-600 hover:bg-yellow-100"
                        : "border-gray-300 text-gray-600 hover:bg-yellow-50 hover:border-yellow-300"
                    }`}
                    onClick={() => setLiked(!liked)}
                  >
                    <Heart
                      className={`w-4 h-4 transition-all ${
                        liked ? "fill-yellow-500 scale-110" : ""
                      }`}
                    />
                    <span className="text-sm font-medium">Yêu thích</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <p className="text-sm">{fullAddress}</p>
                </div>

                {shop.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {shop.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-600 px-3 py-1.5 border border-yellow-200"
                    >
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-bold text-gray-900">
                        {shop.rating || "N/A"}
                      </span>
                    </Badge>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-yellow-600 hover:text-yellow-700 hover:underline text-sm font-medium"
                      onClick={() => setShowInfo(true)}
                    >
                      Thông tin quán
                    </Button>
                  </div>
                  {shop.phone && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Phone className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">{shop.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-2 border-yellow-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-400 rounded-full px-4 transition-all bg-transparent"
                    onClick={() => setShowSimilar(!showSimilar)}
                  >
                    <span className="font-medium">Nhà hàng tương tự</span>
                    <span
                      className={`text-xs transition-transform duration-300 ${
                        showSimilar ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-2 border-yellow-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-400 rounded-full px-4 transition-all bg-transparent"
                  >
                    <User className="w-4 h-4" />
                    <span className="font-medium">Đặt theo nhóm</span>
                  </Button>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <Input
                    type="search"
                    placeholder="Tìm kiếm món ăn trong quán..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-yellow-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 rounded-xl transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md bg-yellow-50 border border-yellow-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>Đăng nhập để đặt hàng</DialogTitle>
            <DialogDescription>
              Bạn cần đăng nhập để thêm món vào giỏ hàng và đặt đơn hàng.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
              Hủy
            </Button>
            <Button
              onClick={() => {
                setShowLoginDialog(false);
                navigate("/auth/login");
              }}
            >
              Đăng nhập
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đã thêm vào giỏ hàng!</DialogTitle>
            <DialogDescription>
              {addedFoodName} đã được thêm vào giỏ hàng của bạn.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restaurant Info Modal */}
      {showInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowInfo(false);
          }}
        >
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-amber-50">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9 p-0 hover:bg-white/80 rounded-full flex-shrink-0"
                  onClick={() => setShowInfo(false)}
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </Button>
                <span className="text-sm font-medium text-gray-600 truncate">
                  {shop.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 p-0 hover:bg-white/80 rounded-full flex-shrink-0"
                onClick={() => setShowInfo(false)}
              >
                <X className="w-5 h-5 text-gray-600" />
              </Button>
            </div>

            <ScrollArea className="max-h-[calc(90vh-80px)]">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-5 text-gray-900">
                  Thông tin quán
                </h3>
                <div className="mb-6 p-5 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border border-yellow-100">
                  <h4 className="text-base font-bold text-gray-900 mb-3">
                    {shop.name}
                  </h4>
                  <div className="flex items-start gap-2 text-gray-600 text-sm mb-2">
                    <MapPin className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>{fullAddress}</span>
                  </div>
                  {shop.phone && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Phone className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      <span>{shop.phone}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h5 className="text-base font-bold mb-4 text-gray-900">
                    Giờ hoạt động
                  </h5>
                  <div className="space-y-2">
                    {openingHours.map((hour) => (
                      <div
                        key={hour.day}
                        className={`flex justify-between items-center p-4 rounded-xl border transition-all ${
                          hour.isToday
                            ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-sm"
                            : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                        }`}
                      >
                        <span
                          className={`text-sm font-medium ${
                            hour.isToday ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {hour.day}
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            hour.isToday ? "text-yellow-600" : "text-gray-600"
                          }`}
                        >
                          {hour.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Similar Restaurants Section */}
      {showSimilar && similarShops.length > 0 && (
        <Card className="border-0 shadow-md mx-auto max-w-7xl mt-4 rounded-none sm:rounded-2xl animate-in slide-in-from-top duration-300">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-5">
              Nhà hàng tương tự
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similarShops.map((restaurant) => (
                <Card
                  key={restaurant._id}
                  onClick={() => navigate(`/shops/${restaurant._id}`)}
                  className="overflow-hidden border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={restaurant.img}
                      alt={restaurant.name}
                      className="w-full h-44 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {restaurant.badge && (
                      <Badge className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 shadow-md">
                        {restaurant.badge}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full w-9 h-9 shadow-md backdrop-blur-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Heart className="w-4 h-4 text-gray-600 hover:text-yellow-500 transition-colors" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                      {restaurant.name}
                    </h4>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                      {restaurant.address}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-600 font-medium">
                          {restaurant.distance}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-gray-900">
                          {restaurant.rating}
                        </span>
                        <span className="text-gray-500">
                          ({restaurant.reviews}+)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <Card className="border-0 shadow-sm sticky top-0 z-20 bg-white/95 backdrop-blur-md rounded-none">
        <CardContent className="p-0">
          <ScrollArea className="whitespace-nowrap py-4">
            <div className="max-w-7xl mx-auto px-6 flex gap-3">
              {categories.map((cat) => (
                <Button
                  key={cat.name}
                  variant={
                    selectedCategory === cat.name ? "default" : "outline"
                  }
                  size="sm"
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === cat.name
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-500 text-white shadow-lg shadow-yellow-200 scale-105"
                      : "border-2 border-gray-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-300"
                  }`}
                  onClick={() => setSelectedCategory(cat.name)}
                >
                  {cat.name}
                  <Badge
                    variant={
                      selectedCategory === cat.name ? "default" : "secondary"
                    }
                    className={`text-xs font-bold ${
                      selectedCategory === cat.name
                        ? "bg-white/30 text-white"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {cat.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-yellow-600 to-yellow-600 bg-clip-text text-transparent">
          {selectedCategory === "Tất cả"
            ? "TẤT CẢ SẢN PHẨM"
            : selectedCategory.toUpperCase()}
        </h2>

        {filteredFoods.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFoods.map((food) => {
              const finalPrice = food.discount
                ? food.price * (1 - food.discount / 100)
                : food.price;

              return (
                <Card
                  key={food._id}
                  className="overflow-hidden border-gray-200 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={
                        food.image_url ||
                        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085"
                      }
                      alt={food.name}
                      className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {food.discount > 0 && (
                      <Badge className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 shadow-lg">
                        Giảm {food.discount}%
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardContent className="p-5">
                    <CardTitle className="font-bold text-gray-900 mb-2 line-clamp-2 text-base leading-snug min-h-[3rem]">
                      {food.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                      {food.description || "Món ăn ngon tại quán"}
                    </CardDescription>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex flex-col gap-1">
                        {food.discount > 0 && (
                          <span className="text-sm text-gray-400 line-through">
                            {food.price.toLocaleString()}đ
                          </span>
                        )}
                        <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-600 bg-clip-text text-transparent">
                          {Math.round(finalPrice).toLocaleString()}đ
                        </span>
                      </div>

                      <Button
                        size="sm"
                        disabled={addingToCart === food._id}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-4 py-2 transition-all disabled:opacity-50"
                        onClick={() => handleAddToCart(food)}
                      >
                        {addingToCart === food._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Thêm
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
