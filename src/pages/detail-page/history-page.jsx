import { useEffect, useState } from "react"
import { ChevronDown, Store, Calendar, Receipt, CreditCard, MapPin, Package, X } from "lucide-react"
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
        const res = await getOrders()
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
              restaurant: o.shop?.name || "Không xác định",
              address: o.deliveryAddress?.address?.street || "Không xác định",
              items: o.cartItems || [],
              total: o.totalAmount || 0,
              subtotal: o.subtotal || 0,
              shippingFee: o.shippingFee || 0,
              discount: o.discountAmount || 0,
              paymentMethod: o.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : o.paymentMethod,
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
          <p className="text-muted-foreground text-pretty">Theo dõi và quản lý các đơn hàng của bạn tại YummyGo</p>
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
                  {/* Collapsed Header - Always Visible */}
                  <div className="w-full p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex-1 text-left" onClick={() => toggleOrder(order.id)}>
                      <div className="flex items-center gap-3 mb-2">
                        <Store className="w-5 h-5 text-primary flex-shrink-0" />
                        <h3 className="font-semibold text-foreground text-lg">{order.restaurant}</h3>
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

                  {/* Expanded Details */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-5 pb-5 pt-2 border-t border-border bg-muted/20">
                      {/* Order Items */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Món ăn ({order.items.length})
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start text-sm bg-card p-3 rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{item.food?.name || "Món ăn"}</p>
                                {item.note && (
                                  <p className="text-xs text-muted-foreground mt-1">Ghi chú: {item.note}</p>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-muted-foreground">x{item.quantity}</p>
                                <p className="font-medium text-foreground">{item.price.toLocaleString("vi-VN")}₫</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-card p-3 rounded-lg">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Địa chỉ giao hàng</p>
                              <p className="text-sm text-foreground">{order.address}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-card p-3 rounded-lg">
                          <div className="flex items-start gap-2">
                            <CreditCard className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Phương thức thanh toán</p>
                              <p className="text-sm text-foreground">{order.paymentMethod}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Note */}
                      {order.note && (
                        <div className="bg-card p-3 rounded-lg mb-4">
                          <p className="text-xs text-muted-foreground mb-1">Ghi chú đơn hàng</p>
                          <p className="text-sm text-foreground">{order.note}</p>
                        </div>
                      )}

                      {/* Price Breakdown */}
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

      {/* Cancel Dialog */}
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