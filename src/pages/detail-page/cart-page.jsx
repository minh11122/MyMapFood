import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  getCartByUser,
  updateCartItem,
  removeCartItem,
} from "@/services/cart.service";

export const CartPage = () => {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  // 🧺 Lấy giỏ hàng khi vào trang
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await getCartByUser(userId);
        setCartData(res.data.data || []);
      } catch (err) {
        console.error("Lỗi khi lấy giỏ hàng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [userId]);

  const handleSelectShop = (shopId) => {
    if (selectedShop === shopId) {
      // Bỏ chọn shop
      setSelectedShop(null);
      setSelectedItems([]);
    } else {
      // Chọn shop mới, bỏ shop cũ
      const shop = cartData.find((g) => g.shop._id === shopId);
      const itemIds = shop.items.map((it) => it._id);
      setSelectedShop(shopId);
      setSelectedItems(itemIds);
    }
  };

  const handleSelectItem = (shopId, itemId) => {
    if (selectedShop && selectedShop !== shopId) {
      alert("Chỉ có thể chọn món của 1 quán tại 1 thời điểm!");
      return;
    }
    if (!selectedShop) setSelectedShop(shopId);

    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleQuantityChange = async (cartItemId, newQty) => {
    if (newQty < 1) return;
    try {
      await updateCartItem(cartItemId, { quantity: newQty });
      setCartData((prev) =>
        prev.map((group) => ({
          ...group,
          items: group.items.map((it) =>
            it._id === cartItemId ? { ...it, quantity: newQty } : it
          ),
        }))
      );
    } catch (err) {
      console.error("Lỗi cập nhật số lượng:", err);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeCartItem(cartItemId);
      setCartData((prev) =>
        prev
          .map((group) => ({
            ...group,
            items: group.items.filter((it) => it._id !== cartItemId),
          }))
          .filter((group) => group.items.length > 0)
      );
    } catch (err) {
      console.error("Lỗi xóa món:", err);
    }
  };

  const handleCheckout = () => {
  if (!selectedShop || selectedItems.length === 0) {
    alert("Vui lòng chọn món ăn của 1 quán để thanh toán!");
    return;
  }

  const selectedGroup = cartData.find((g) => g.shop._id === selectedShop);
  const itemsToCheckout = selectedGroup.items.filter((i) =>
    selectedItems.includes(i._id)
  );

  // 👉 Điều hướng sang trang checkout và truyền dữ liệu
  navigate("/checkout", {
    state: {
      shop: selectedGroup.shop,
      items: itemsToCheckout,
      totalPrice,
      shippingFee,
      finalTotal,
    },
  });
};


  // 💰 Tổng tiền của các món được chọn
  const totalPrice = cartData.reduce((sum, group) => {
    if (group.shop._id !== selectedShop) return sum;
    return (
      sum +
      group.items
        .filter((i) => selectedItems.includes(i._id))
        .reduce((s, item) => {
          const price = item.discount
            ? item.price * (1 - item.discount / 100)
            : item.price;
          return s + price * item.quantity;
        }, 0)
    );
  }, 0);

  const shippingFee = totalPrice > 0 ? 15000 : 0;
  const finalTotal = totalPrice + shippingFee;

  if (loading) return <p className="text-center py-10">Đang tải giỏ hàng...</p>;

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 min-h-screen pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
          </Button>
        </div>

        {cartData.map((group) => (
          <Card
            key={group.shop._id}
            className={`shadow-lg transition-all ${
              selectedShop === group.shop._id ? "ring-2 ring-yellow-500" : ""
            }`}
          >
            <CardHeader className="flex flex-row justify-between items-center bg-yellow-50 rounded-t-lg">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedShop === group.shop._id}
                  onCheckedChange={() => handleSelectShop(group.shop._id)}
                />
                <img
                  src={group.shop.logoUrl || "/placeholder.svg"}
                  alt={group.shop.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <CardTitle className="text-lg font-semibold">
                    {group.shop.name}
                  </CardTitle>
                  <CardDescription className="text-gray-500 text-sm">
                    {[
                      group.shop?.address?.street,
                      group.shop?.address?.ward,
                      group.shop?.address?.district,
                      group.shop?.address?.city,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {group.items.map((item) => {
                const price = item.discount
                  ? item.price * (1 - item.discount / 100)
                  : item.price;

                return (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 border rounded-lg p-3 bg-white hover:shadow-sm"
                  >
                    <Checkbox
                      checked={selectedItems.includes(item._id)}
                      onCheckedChange={() =>
                        handleSelectItem(group.shop._id, item._id)
                      }
                    />
                    <img
                      src={item.image_url || item.food?.image_url || "/placeholder.svg"}
                      alt={item.food?.name || item.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.food?.name || item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {price.toLocaleString()}đ × {item.quantity}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item._id)}
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}

        <Card className="shadow-lg sticky bottom-0 bg-white">
          <CardContent className="p-6 flex flex-col gap-3">
            <div className="flex justify-between text-gray-700">
              <span>Tạm tính</span>
              <span>{totalPrice.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Phí vận chuyển</span>
              <span>{shippingFee.toLocaleString()}đ</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng cộng</span>
              <span className="text-yellow-600">
                {finalTotal.toLocaleString()}đ
              </span>
            </div>
            <Button
              disabled={isCheckingOut || !selectedShop}
              onClick={handleCheckout}
              className="mt-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
            >
              {isCheckingOut ? "Đang xử lý..." : <><CreditCard className="w-4 h-4 mr-2"/>Thanh toán</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
