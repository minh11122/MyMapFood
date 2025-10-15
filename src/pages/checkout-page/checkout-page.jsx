import { useState, useEffect } from "react";
import {
  MapPin,
  ChevronDown,
  Tag,
  Shield,
  AlertCircle,
  Trash2,
  Edit,
  X,
  Navigation,
  Minus,
  Plus,
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocation } from "react-router-dom";
import {
  updateCartItem,
  removeCartItem,
  getVouchersByShop,
} from "@/services/cart.service";
import { getUserProfile } from "@/services/customer.service";
import { createOrder } from "@/services/order.service";

export const CheckOutPage = () => {
  const [selectedPayment, setSelectedPayment] = useState("VNPAY");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [fastDelivery, setFastDelivery] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  // Dialog states
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showLocationErrorDialog, setShowLocationErrorDialog] = useState(false);
  const [locationErrorMessage, setLocationErrorMessage] = useState("");

  const location = useLocation();
  const { shop, totalPrice, finalTotal } = location.state || {};

  const handlePlaceOrder = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?._id) {
        setShowLoginDialog(true);
        return;
      }

      // Chuẩn bị cartItems dạng backend mong đợi
      const cartData = cartItems.map((item) => ({
        foodId: item._id || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const orderPayload = {
        customer: user._id,
        shop: shop._id,
        deliveryAddress,
        cartItems: cartData.map((c) => c.foodId), // backend nhận id cartItem
        voucher: selectedVoucher?._id || null,
        discountAmount: voucherDiscount,
        subtotal,
        shippingFee,
        totalAmount: total,
        paymentMethod: selectedPayment === "cash" ? "COD" : selectedPayment,
        note: "", // nếu muốn, bạn có thể lấy từ input ghi chú
      };

      const res = await createOrder(orderPayload);

      if (res.data.success) {
        setShowSuccessDialog(true);
        // Xử lý chuyển trang đến lịch sử đơn hàng
        window.location.href = "/shops/history";
      } else {
        setErrorMessage("Đặt món thất bại: " + res.data.message);
        setShowErrorDialog(true);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Có lỗi xảy ra khi đặt món!");
      setShowErrorDialog(true);
    }
  };

  useEffect(() => {
    setCartItems(location.state?.items || []);
  }, [location.state]);

  const paymentMethods = [
    {
      id: "VNPAY",
      name: "QR VNPAY",
      icon: "C",
      color: "bg-pink-100 text-pink-600",
    },
    {
      id: "cash",
      name: "TIỀN MẶT",
      icon: "💵",
      color: "bg-green-100 text-green-600",
    },
  ];

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = 76000;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id;
    if (userId) {
      getUserProfile(userId)
        .then((profile) => {
          if (profile) {
            const p = profile;
            setRecipientName(p.user.full_name || "");
            setPhone(p.user.phone || "");
            setEmail(p.account.email || "");
            const defAddr = p.addresses.find((a) => a.isDefault);
            if (defAddr) {
              const a = defAddr.address;
              setDeliveryAddress(
                [a.street, a.ward, a.district, a.city, a.province]
                  .filter(Boolean)
                  .join(", ")
              );
            }
          }
        })
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (shop?._id) {
      getVouchersByShop(shop._id)
        .then((res) => {
          if (res.data.success) {
            setVouchers(res.data.data);
          }
        })
        .catch(console.error);
    }
  }, [shop]);

  const handleGetLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
              {
                headers: { "User-Agent": "MyApp/1.0 (your-email@example.com)" },
              }
            );
            const data = await response.json();
            if (data.address) {
              const a = data.address;
              const formattedAddress = [
                a.house_number,
                a.road,
                a.neighbourhood,
                a.suburb,
                a.village,
                a.town,
                a.city_district,
                a.city,
                a.state,
                a.country,
              ]
                .filter(Boolean)
                .join(", ");
              setDeliveryAddress(
                formattedAddress || `Lat: ${lat}, Lng: ${lon}`
              );
            } else setDeliveryAddress(`Lat: ${lat}, Lng: ${lon}`);
          } catch (err) {
            console.error(err);
            setLocationErrorMessage("Không thể lấy địa chỉ!");
            setShowLocationErrorDialog(true);
          }
        },
        (err) => {
          setLocationErrorMessage("Không lấy được vị trí: " + err.message);
          setShowLocationErrorDialog(true);
        }
      );
    } else {
      setLocationErrorMessage("Trình duyệt không hỗ trợ định vị!");
      setShowLocationErrorDialog(true);
    }
  };

  const calculateDiscount = (voucher, amount) => {
    if (!voucher || !voucher.isActive) return 0;
    const now = new Date();
    if (now < new Date(voucher.startDate) || now > new Date(voucher.endDate))
      return 0;
    if (voucher.usedCount >= voucher.usageLimit) return 0;
    if (amount < voucher.minOrderAmount) return 0;
    if (voucher.discountType === "PERCENT") {
      const disc = amount * (voucher.discountValue / 100);
      return Math.min(disc, voucher.maxDiscount || disc);
    } else {
      return voucher.discountValue;
    }
  };

  const voucherDiscount = selectedVoucher
    ? calculateDiscount(selectedVoucher, subtotal)
    : 0;
  const total = subtotal + shippingFee - voucherDiscount;

  const getCurrentPayment = () => {
    return paymentMethods.find((m) => m.id === selectedPayment);
  };

  const validVouchers = vouchers.filter(
    (v) => calculateDiscount(v, subtotal) > 0
  );

  const handleQuantityChange = async (cartItemId, newQty) => {
    if (newQty < 1) return;
    try {
      await updateCartItem(cartItemId, { quantity: newQty });
      setCartItems((prev) =>
        prev.map((it) =>
          it._id === cartItemId ? { ...it, quantity: newQty } : it
        )
      );
    } catch (err) {
      console.error("Lỗi cập nhật số lượng:", err);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeCartItem(cartItemId);
      setCartItems((prev) => prev.filter((it) => it._id !== cartItemId));
    } catch (err) {
      console.error("Lỗi xóa món:", err);
    }
  };

  return (
    <div className="bg-[#F7EFDF] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Section */}
            <Card className="border-orange-100 shadow-sm">
              <CardHeader className="p-6">
                <CardTitle className="text-xl font-bold text-gray-900 mb-4">
                  Giao tới
                </CardTitle>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Tên người nhận
                    </Label>
                    <Input
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-4 py-3 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Số điện thoại
                    </Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Địa chỉ
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 pointer-events-none" />
                      <Input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-10 top-1/2 -translate-y-1/2 p-0 h-5 w-5"
                      >
                        <Edit className="w-5 h-5 text-gray-400 hover:text-orange-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0 h-5 w-5"
                        onClick={handleGetLocation}
                      >
                        <Navigation className="w-5 h-5 text-gray-400 hover:text-orange-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Ghi chú cho tài xế
                    </Label>
                    <Input
                      type="text"
                      placeholder="Vd: Bác tài vui lòng gọi trước khi đến giao"
                      className="w-full px-4 py-3 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 placeholder:text-gray-400"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">
                      Giao hàng tận cửa chỉ với 5.000đ
                    </span>
                    <Checkbox
                      checked={fastDelivery}
                      onCheckedChange={(checked) => setFastDelivery(!!checked)}
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Order Items */}
            <Card className="border-orange-100 shadow-sm">
              <CardHeader className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    ĐƠN HÀNG ({cartItems.length})
                  </CardTitle>
                  <Button
                    variant="link"
                    className="text-sm text-orange-500 hover:text-orange-600 font-medium p-0 h-auto"
                  >
                    Thêm món
                  </Button>
                </div>

                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item._id || item.id}
                      className="flex items-center gap-4 py-4 border-b border-orange-100 last:border-0"
                    >
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleQuantityChange(
                                    item._id || item.id,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="text-sm font-medium text-gray-900 min-w-[20px] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleQuantityChange(
                                    item._id || item.id,
                                    item.quantity + 1
                                  )
                                }
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {item.name}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRemoveItem(item._id || item.id)
                            }
                            className="text-gray-400 hover:text-red-500 p-0 h-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          variant="link"
                          className="text-xs text-orange-500 hover:underline p-0 h-auto"
                        >
                          Chỉnh sửa món
                        </Button>
                        <div className="mt-2 text-sm font-semibold text-gray-900">
                          {(item.price * item.quantity).toLocaleString()}đ
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <Card className="border-orange-200 shadow-lg sticky top-24">
              <CardHeader className="p-6">
                <CardTitle className="text-xl font-bold text-gray-900 mb-4">
                  Thanh toán
                </CardTitle>

                {/* Payment Method & Promotions Integrated */}
                <div className="space-y-4 mb-6">
                  <div className="mb-4">
                    <Label className="text-sm font-medium text-gray-700">
                      Hình thức thanh toán
                    </Label>
                    <select
                      value={selectedPayment}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-full mt-2 border border-orange-300 rounded-lg p-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    >
                      {paymentMethods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <Label className="text-sm font-medium text-gray-700">
                      Mã giảm giá
                    </Label>
                    <select
                      value={selectedVoucher?._id || ""}
                      onChange={(e) => {
                        const id = e.target.value;
                        if (id) {
                          setSelectedVoucher(
                            vouchers.find((v) => v._id === id)
                          );
                        } else {
                          setSelectedVoucher(null);
                        }
                      }}
                      className="w-full mt-2 border border-orange-300 rounded-lg p-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    >
                      <option value="">Chọn mã giảm giá</option>
                      {validVouchers.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.code} -{" "}
                          {v.discountType === "PERCENT"
                            ? `${v.discountValue}% `
                            : `${v.discountValue.toLocaleString("vi-VN")}đ `}
                          (min {v.minOrderAmount.toLocaleString("vi-VN")}đ)
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedVoucher && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <Tag className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-900">
                        Đã áp dụng: {selectedVoucher.code}
                      </span>
                    </div>
                  )}

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-between p-0 h-auto"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-medium text-gray-900">
                          Đơn hàng có Bảo hiểm Food Care
                        </span>
                      </div>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 mb-4 pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính (1 phần)</span>
                    <span className="font-medium text-gray-900">
                      {subtotal.toLocaleString()}đ
                    </span>
                  </div>
                  <Separator className="border-orange-100" />
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Phí áp dụng</span>
                      <AlertCircle className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="font-medium text-gray-900">
                      {shippingFee.toLocaleString()}đ
                    </span>
                  </div>
                  <Separator className="border-orange-100" />
                  {voucherDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {selectedVoucher.code}
                      </span>
                      <Badge
                        variant="secondary"
                        className="font-medium text-green-600"
                      >
                        -{voucherDiscount.toLocaleString()}đ
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Tổng số tiền
                    </span>
                    <div className="text-right">
                      <span className="text-sm text-gray-400 line-through block">
                        {(subtotal + shippingFee).toLocaleString()}đ
                      </span>
                      <span className="text-2xl font-bold text-orange-500">
                        {total.toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold py-4 rounded-lg shadow-md transition"
                  onClick={handlePlaceOrder}
                >
                  Đặt món
                </Button>

                <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
                  <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p>
                    Bằng việc tiếp tục, bạn đồng ý với{" "}
                    <a href="#" className="text-orange-500 hover:underline">
                      Điều khoản sử dụng
                    </a>{" "}
                    của YummyGo
                  </p>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đăng nhập để đặt món</DialogTitle>
            <DialogDescription>
              Bạn cần đăng nhập để đặt món.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
              Hủy
            </Button>
            <Button onClick={() => { setShowLoginDialog(false); window.location.href = "/login"; }}>
              Đăng nhập
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đặt món thành công!</DialogTitle>
            <DialogDescription>
              Đơn hàng của bạn đã được đặt thành công.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lỗi</DialogTitle>
            <DialogDescription>
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowErrorDialog(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Location Error Dialog */}
      <Dialog open={showLocationErrorDialog} onOpenChange={setShowLocationErrorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lỗi lấy vị trí</DialogTitle>
            <DialogDescription>
              {locationErrorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowLocationErrorDialog(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};