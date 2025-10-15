import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Star, Heart,ArrowLeft  } from "lucide-react"
import { Card } from "@/components/ui/card"
import { getFoodsByType } from "@/services/shop.service" // Adjust the import path as needed

const categoryTitles = {
  "do-uong": "Đồ uống",
  "do-an": "Thức Ăn",
}

export const MenuListPage = () => {
  const { category } = useParams()
  const navigate = useNavigate()
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true)
        const response = await getFoodsByType(category)
        if (response.data.success) {
          // Map API data to component format
          const mappedFoods = response.data.data.map((food) => ({
            id: food._id,
            name: food.name,
            image: food.image_url,
            rating: 4.5, // Default rating; fetch separately if needed
            reviews: Math.floor(Math.random() * 100) + 50, // Placeholder; replace with real data
            address: `${food.shop_id.address.street}, ${food.shop_id.address.ward}, ${food.shop_id.address.district}, ${food.shop_id.address.city}`,
            isPromo: food.discount > 0,
            category: food.category_id.name || categoryTitles[category] || "Uncategorized",
            price: food.price,
            description: food.description,
            isAvailable: food.is_available,
          }))
          setFoods(mappedFoods)
        }
      } catch (err) {
        setError("Không thể tải dữ liệu. Vui lòng thử lại.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (category) {
      fetchFoods()
    }
  }, [category])

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Đang tải...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    )
  }

  const categoryData = { title: categoryTitles[category] || "Danh mục không xác định" }

  const filteredItems = foods.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
    <div className="max-w-7xl mx-auto p-4 pt-6">
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-4 text-gray-700 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5" />
        Quay lại
      </button>

      {/* Category Title */}
      <h2 className="text-5xl font-bold text-gray-800 mb-6 text-center">
        {categoryData.title}
      </h2>

      {/* Banner / ảnh đồ uống */}
      {/* {category === "do-uong" && (
        <div className="w-full mb-6 flex justify-center">
          <img
            src="/img-home/drinks.jpg" 
            alt="Đồ uống"
            className="w-1/2 rounded-lg shadow-md object-cover"
          />
        </div>
      )} */}

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            onClick={() => navigate(`/detail/${item.id}`)}
            className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
          >
            <div className="relative">
              <img
                src={
                  item.image ||
                  `/placeholder.svg?height=200&width=300&query=${item.category}`
                }
                alt={item.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {item.isPromo && (
                <div className="absolute top-3 left-3">
                  <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">
                    PROMO
                  </span>
                </div>
              )}
              {!item.isAvailable && (
                <div className="absolute top-3 left-3">
                  <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                    HẾT HÀNG
                  </span>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(item.id)
                }}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <Heart
                  className={`w-4 h-4 ${
                    favorites.includes(item.id)
                      ? "fill-red-500 text-red-500"
                      : "text-gray-600"
                  }`}
                />
              </button>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-sm leading-tight">
                {item.name}
              </h3>
              <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                {item.price.toLocaleString()} VNĐ
              </p>
              {item.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                  {item.description}
                </p>
              )}
              <p className="text-xs text-gray-600 mb-3 line-clamp-1">
                {item.address}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{item.rating}</span>
                  <span className="text-xs text-gray-500">
                    ({item.reviews})
                  </span>
                </div>
                <span className="text-xs text-yellow-600 font-medium">
                  {item.category}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredItems.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Không tìm thấy kết quả cho "{searchQuery}"
          </p>
        </div>
      )}

      {foods.length === 0 && !searchQuery && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Không có món ăn nào trong danh mục này.</p>
        </div>
      )}
    </div>
  </div>
)
}