import { useEffect, useState } from "react"
import { ChevronDown, Store, Calendar, Receipt, CreditCard, MapPin, Package, X, User, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getOrders, cancelOrder } from "@/services/order.service"

export const HistoryPage = () => {
  const [allOrders, setAllOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("unfinished")
  const [expandedOrders, setExpandedOrders] = useState(new Set())
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // 🔹 Lấy user từ localStorage (đã lưu khi đăng nhập)
      const user = JSON.parse(localStorage.getItem("user"))
      const userId = user?._id

      if (!userId) {
        console.error("❌ Không tìm thấy userId trong localStorage")
        return
      }

      // 🔹 Gọi API có kèm userId
      const res = await getOrders(userId)
        if (res.data.success) {
          setAllOrders(
            res.data.data.map((o) => ({
              id: o._id,
              orderCode: o.orderCode,
              date: new Date(o.createdAt).toLocaleDateString("vi-VN"),
              time: new Date(o.createdAt).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              // ✅ NGƯỜI ĐẶT HÀNG (CUSTOMER)
              customerName: o.customer?.full_name || "Không xác định",
              customerPhone: o.customer?.phone || "",
              customerAvatar: o.customer?.avatar_url || "",
              // ✅ NGƯỜI NHẬN HÀNG
              receiverName: o.receiverName || "Không xác định",
              receiverPhone: o.receiverPhone || "",
              receiverEmail: o.receiverEmail || "",
              // ✅ CỬA HÀNG
              shopName: o.shop?.name || "Không xác định",
              shopImage: o.shop?.img || "",
              shopAddress: `${o.shop?.address?.street || ''}, ${o.shop?.address?.ward || ''}, ${o.shop?.address?.district || ''}, ${o.shop?.address?.city || ''}`.trim(),
              // ✅ ĐỊA CHỈ GIAO HÀNG
              deliveryAddress: o.deliveryAddress?.address?.street || "Không xác định",
              // ✅ SẢN PHẨM
              items: (o.cartItems || []).map(item => ({
                ...item,
                foodImage: item.food?.image_url || item.food?.img || o.shop?.img || "",
                shopImage: o.shop?.img || "",
              })),
              // ✅ GIÁ TIỀN (từ API)
              total: o.totalAmount || 0,
              subtotal: o.subtotal || 0,
              shippingFee: o.shippingFee || 0,
              discount: o.discountAmount || 0,
              // ✅ THANH TOÁN
              paymentMethod: o.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : o.paymentMethod,
              paymentStatus: o.paymentStatus,
              // ✅ TRẠNG THÁI
              status:
                o.status === "DELIVERED"
                  ? "Hoàn thành"
                  : o.status === "CANCELLED"
                    ? "Đã hủy"
                    : o.status === "PENDING_PAYMENT"
                      ? "Chờ thanh toán"
                      : o.status === "CONFIRMED"
                        ? "Đã xác nhận"
                        : o.status === "PREPARING"
                          ? "Đang chuẩn bị"
                          : o.status === "SHIPPED"
                            ? "Đang giao"
                            : o.status,
              originalStatus: o.status,
              note: o.note || "",
            })),
          )
        }
      } catch (err) {
        console.error("Lỗi khi lấy lịch sử đơn hàng:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  const handleCancelOrder = async () => {
    try {
      const res = await cancelOrder(selectedOrderId)
      if (res.data.success) {
        setAllOrders((prev) =>
          prev.map((o) =>
            o.id === selectedOrderId
              ? { ...o, status: "Đã hủy", originalStatus: "CANCELLED" }
              : o
          )
        )
        setShowCancelDialog(false)
        setSelectedOrder(null)
        setSelectedOrderId(null)
      } else {
        console.error("Hủy đơn hàng thất bại")
      }
    } catch (err) {
      console.error("Lỗi khi hủy đơn hàng:", err)
    }
  }

  const openCancelDialog = (order) => {
    setSelectedOrder(order)
    setSelectedOrderId(order.id)
    setShowCancelDialog(true)
  }

  const unfinishedOrders = allOrders.filter((order) => !["DELIVERED", "CANCELLED"].includes(order.originalStatus))
  const completedOrders = allOrders.filter((order) => ["DELIVERED", "CANCELLED"].includes(order.originalStatus))

  const currentOrders = activeTab === "unfinished" ? unfinishedOrders : completedOrders

  const getStatusColor = (status) => {
    switch (status) {
      case "Hoàn thành":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "Đã hủy":
        return "bg-red-50 text-red-700 border-red-200"
      case "Chờ thanh toán":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "Đang chuẩn bị":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "Đang giao":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "Đã xác nhận":
        return "bg-cyan-50 text-cyan-700 border-cyan-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Đang tải lịch sử đơn hàng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">Lịch sử đơn hàng</h1>
          <p className="text-muted-foreground text-pretty">Theo dõi và quản lý các đơn hàng của bạn tại MyMapFood</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("unfinished")}
            className={`px-6 py-3 font-medium transition-all relative ${
              activeTab === "unfinished" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Chưa hoàn thành
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-muted">{unfinishedOrders.length}</span>
            {activeTab === "unfinished" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>}
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-3 font-medium transition-all relative ${
              activeTab === "completed" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Đã hoàn thành
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-muted">{completedOrders.length}</span>
            {activeTab === "completed" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>}
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {currentOrders.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border border-border">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg mb-1">Chưa có đơn hàng</p>
              <p className="text-muted-foreground text-sm">
                {activeTab === "unfinished"
                  ? "Bạn chưa có đơn hàng nào đang xử lý"
                  : "Bạn chưa có đơn hàng nào đã hoàn thành hoặc bị hủy"}
              </p>
            </div>
          ) : (
            currentOrders.map((order) => {
              const isExpanded = expandedOrders.has(order.id)
              const canCancel = order.originalStatus === "PENDING_PAYMENT"
              return (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:shadow-md"
                >
                  {/* HEADER */}
                  <div className="w-full p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex-1 text-left" onClick={() => toggleOrder(order.id)}>
                      <div className="flex items-center gap-3 mb-2">
                        {/* Ảnh cửa hàng trong header */}
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                          {order.shopImage ? (
                            <img
                              src={order.shopImage}
                              alt={order.shopName}
                              
                              className="object-cover"
                            />
                          ) : (
                            <Store className="w-5 h-5 text-muted-foreground m-auto mt-2.5" />
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground text-lg">{order.shopName}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Receipt className="w-4 h-4" />
                          {order.orderCode}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {order.date} • {order.time}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <div className="text-xl font-bold text-foreground">{order.total.toLocaleString("vi-VN")}₫</div>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mt-1 ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {order.status}
                        </span>
                        {canCancel && (
                          <div className="mt-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                openCancelDialog(order)
                              }}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Hủy
                            </Button>
                          </div>
                        )}
                      </div>
                      {!canCancel && (
                        <ChevronDown
                          className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 cursor-pointer ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                          onClick={() => toggleOrder(order.id)}
                        />
                      )}
                    </div>
                  </div>

                  {/* EXPANDED DETAILS */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded ? "max-h-[2500px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-5 pb-5 pt-2 border-t border-border bg-muted/20">
                      
                      {/* ✅ 1. THÔNG TIN NGƯỜI ĐẶT HÀNG */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Người đặt hàng</span>
                        </h4>
                        <div className="bg-card p-4 rounded-lg">
                          <div className="flex items-start gap-4">
                            {/* Avatar người đặt */}
                            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-muted">
                              {order.customerAvatar ? (
                                <img
                                  src={order.customerAvatar}
                                  alt={order.customerName}
                                  
                                  className="object-cover"
                                />
                              ) : (
                                <User className="w-6 h-6 text-muted-foreground m-auto mt-3" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground truncate">{order.customerName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm text-foreground">{order.customerPhone}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ✅ 2. THÔNG TIN CỬA HÀNG */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Store className="w-4 h-4" />
                          <span>Cửa hàng</span>
                        </h4>
                        <div className="bg-card p-4 rounded-lg">
                          <div className="flex items-start gap-4">
                            {/* Ảnh cửa hàng */}
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                              {order.shopImage ? (
                                <img
                                  src={order.shopImage}
                                  alt={order.shopName}
                                  
                                  className="object-cover"
                                />
                              ) : (
                                <Store className="w-8 h-8 text-muted-foreground m-auto mt-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-foreground truncate">{order.shopName}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-foreground break-words">{order.shopAddress}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ✅ 3. THÔNG TIN NGƯỜI NHẬN */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Người nhận hàng</span>
                        </h4>
                        <div className="bg-card p-4 rounded-lg space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm font-medium text-foreground">{order.receiverName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm text-foreground">{order.receiverPhone}</span>
                          </div>
                          {order.receiverEmail && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm text-foreground">{order.receiverEmail}</span>
                            </div>
                          )}
                          <div className="flex items-start gap-2 pt-2 border-t border-border mt-2">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-foreground break-words">{order.deliveryAddress}</p>
                          </div>
                        </div>
                      </div>

                      {/* ✅ 4. MÓN ĂN */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Món ăn ({order.items.length})
                        </h4>
                        <div className="space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-card p-4 rounded-lg border border-border">
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                                {item.foodImage ? (
                                  <img
                                    src={item.foodImage}
                                    alt={item.food?.name || "Món ăn"}
                                    
                                    className="object-cover"
                                  />
                                ) : item.shopImage ? (
                                  <img
                                    src={item.shopImage}
                                    alt={item.food?.name || "Món ăn"}
                                    
                                    className="object-cover"
                                  />
                                ) : (
                                  <Package className="w-6 h-6 text-muted-foreground m-auto mt-3" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground text-sm mb-1 truncate">{item.food?.name || "Món ăn"}</p>
                                {item.note && (
                                  <p className="text-xs text-muted-foreground mb-2">Ghi chú: {item.note}</p>
                                )}
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                                  <p className="font-semibold text-foreground text-sm">
                                    {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ✅ 5. THANH TOÁN & GIAO HÀNG */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-card p-3 rounded-lg">
                          <div className="flex items-start gap-2">
                            <CreditCard className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Phương thức thanh toán</p>
                              <p className="text-sm text-foreground">{order.paymentMethod}</p>
                              <p className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
                                order.paymentStatus === "PAID" 
                                  ? "bg-emerald-50 text-emerald-700" 
                                  : "bg-amber-50 text-amber-700"
                              }`}>
                                {order.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-card p-3 rounded-lg">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Địa chỉ giao hàng</p>
                              <p className="text-sm text-foreground break-words">{order.deliveryAddress}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ✅ 6. GHI CHÚ */}
                      {order.note && (
                        <div className="bg-card p-3 rounded-lg mb-4">
                          <p className="text-xs text-muted-foreground mb-1">Ghi chú đơn hàng</p>
                          <p className="text-sm text-foreground">{order.note}</p>
                        </div>
                      )}

                      {/* ✅ 7. PHÂN TÍCH GIÁ */}
                      <div className="bg-card p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tạm tính</span>
                          <span className="text-foreground">{order.subtotal.toLocaleString("vi-VN")}₫</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Phí vận chuyển</span>
                          <span className="text-foreground">{order.shippingFee.toLocaleString("vi-VN")}₫</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-emerald-600">Giảm giá</span>
                            <span className="text-emerald-600">-{order.discount.toLocaleString("vi-VN")}₫</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-border flex justify-between">
                          <span className="font-semibold text-foreground">Tổng cộng</span>
                          <span className="font-bold text-lg text-primary">{order.total.toLocaleString("vi-VN")}₫</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* CANCEL DIALOG */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hủy đơn hàng {selectedOrder?.orderCode} không? 
              Hành động này không thể hoàn tác và đơn hàng sẽ được hủy vĩnh viễn.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Không, giữ nguyên
            </Button>
            <Button variant="destructive" onClick={handleCancelOrder}>
              Có, hủy đơn hàng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}