import { useState } from "react";
import { MapPin, Star, Heart, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const FavoritePage = () => {
  const [favorites, setFavorites] = useState([1, 2]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const restaurants = [
    {
      id: 1,
      name: "Bún Bò Huế 72 - Đường 72",
      address: "318 Đường 72, Xã An Khánh, Hà Nội",
      distance: "13.9 km",
      image:
        "https://images.unsplash.com/photo-1603133872878-8b5c6e2b5e8d",
      isPromo: true,
      rating: 4.5,
      reviews: 120,
      deliveryTime: "25-35 phút",
      category: "Bún bò Huế",
    },
    {
      id: 2,
      name: "Tùng Huế - Bún Bò Huế & Bánh Canh Hải Sản",
      address: "745 Quốc Lộ 72 Chùa Tổng, Phường La...",
      distance: "13.9 km",
      image:
        "https://images.unsplash.com/photo-1605478054185-6cc2e1f908db",
      isPromo: true,
      rating: 4.2,
      reviews: 39,
      deliveryTime: "20-30 phút",
      category: "Bún bò, Bánh canh",
    },
  ];

  return (
    <div className="bg-[#FBF4E6] min-h-screen">
      <section className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Nhà hàng yêu thích
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {restaurants.map((restaurant) => (
            <Card
              key={restaurant.id}
              className="overflow-hidden group hover:shadow-lg transition-all duration-300"
            >
              <div className="relative">
                <img
                  src={restaurant.image || "/placeholder.svg"}
                  alt={restaurant.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {restaurant.isPromo && (
                  <Badge className="absolute top-3 left-3 bg-green-500 hover:bg-green-500 text-white">
                    PROMO
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(restaurant.id)}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorites.includes(restaurant.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600"
                    }`}
                  />
                </Button>
              </div>

              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm">
                  {restaurant.name}
                </h3>

                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{restaurant.rating}</span>
                  <span className="text-xs text-gray-500">
                    ({restaurant.reviews})
                  </span>
                </div>

                <p className="text-xs text-gray-600 line-clamp-1">
                  {restaurant.address}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                  <span className="text-orange-600 font-medium">
                    {restaurant.category}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
