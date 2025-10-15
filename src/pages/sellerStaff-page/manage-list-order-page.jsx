import { useState, useMemo, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

// Dữ liệu mẫu (giả lập từ schema MongoDB)
const mockOrders = [
  {
    _id: "1",
    customerEmail: "user1@example.com",
    restaurantName: "Nhà hàng Á Đông",
    items: "Phở bò, Bánh mì",
    totalAmount: 150000,
    status: "PENDING",
    createdAt: "2025-10-01T10:00:00Z",
  },
  {
    _id: "2",
    customerEmail: "user2@example.com",
    restaurantName: "Bistro Pháp",
    items: "Escargot, Steak",
    totalAmount: 450000,
    status: "PREPARING",
    createdAt: "2025-10-02T12:00:00Z",
  },
  {
    _id: "3",
    customerEmail: "user3@example.com",
    restaurantName: "Pizza Hut",
    items: "Margherita Pizza, Cola",
    totalAmount: 250000,
    status: "READY",
    createdAt: "2025-10-03T15:00:00Z",
  },
  {
    _id: "4",
    customerEmail: "user4@example.com",
    restaurantName: "Sushi Bar",
    items: "Sushi Set, Miso Soup",
    totalAmount: 350000,
    status: "DELIVERED",
    createdAt: "2025-10-04T09:00:00Z",
  },
  {
    _id: "5",
    customerEmail: "user5@example.com",
    restaurantName: "Grill House",
    items: "Burger, Fries",
    totalAmount: 200000,
    status: "PENDING",
    createdAt: "2025-10-04T11:00:00Z",
  },
  // Thêm dữ liệu mẫu để kiểm tra phân trang
  ...Array.from({ length: 10 }, (_, i) => ({
    _id: `${i + 6}`,
    customerEmail: `user${i + 6}@example.com`,
    restaurantName: `Nhà hàng ${i + 6}`,
    items: `Món ăn ${i + 6}, Đồ uống ${i + 6}`,
    totalAmount: 100000 + (i + 1) * 20000,
    status: ["PENDING", "PREPARING", "READY", "DELIVERED"][i % 4],
    createdAt: `2025-10-04T${(i + 10).toString().padStart(2, "0")}:00:00Z`,
  })),
];

// Dữ liệu trạng thái đơn hàng mẫu
const orderStatuses = [
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "PREPARING", label: "Đang chuẩn bị" },
  { value: "READY", label: "Sẵn sàng" },
  { value: "DELIVERED", label: "Đã giao" },
];

export const OrderManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const itemsPerPage = 10;

  // Lọc đơn hàng
  const filteredOrders = useMemo(() => {
    return mockOrders.filter((order) => {
      const matchesSearch = order.customerEmail
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        order._id.includes(searchQuery);
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  // Phân trang
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Reset trang khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Xử lý đổi trạng thái
  const handleStatusChange = async () => {
    setIsUpdating(true);
    try {
      // Giả lập gọi API
      const statusIndex = orderStatuses.findIndex((s) => s.value === selectedOrder.status);
      const newStatus = orderStatuses[(statusIndex + 1) % orderStatuses.length].value;
      // await updateOrderStatus(selectedOrder._id, newStatus);
      // Cập nhật mock data
      mockOrders.find((ord) => ord._id === selectedOrder._id).status = newStatus;
      toast.success(
        `Đã cập nhật trạng thái đơn hàng ${selectedOrder._id} thành ${newStatus}`
      );
      setDialogOpen(false);
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái. Vui lòng thử lại.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Lấy label trạng thái
  const getStatusLabel = (status) => {
    const stat = orderStatuses.find((s) => s.value === status);
    return stat ? stat.label : status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm email khách hàng hoặc ID đơn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {orderStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-gray-700">ID Đơn hàng</TableHead>
                <TableHead className="font-semibold text-gray-700">Email Khách hàng</TableHead>
                <TableHead className="font-semibold text-gray-700">Nhà hàng</TableHead>
                <TableHead className="font-semibold text-gray-700">Món ăn</TableHead>
                <TableHead className="font-semibold text-gray-700">Tổng tiền</TableHead>
                <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
                <TableHead className="font-semibold text-gray-700">Created At</TableHead>
                <TableHead className="font-semibold text-gray-700">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Không tìm thấy đơn hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">#{order._id}</TableCell>
                    <TableCell className="text-sm">{order.customerEmail}</TableCell>
                    <TableCell>{order.restaurantName}</TableCell>
                    <TableCell className="text-sm max-w-xs truncate">{order.items}</TableCell>
                    <TableCell>{order.totalAmount.toLocaleString()} VND</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "PREPARING"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "READY"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setDialogOpen(true);
                        }}
                        className="border-gray-300 hover:bg-blue-50"
                      >
                        Cập nhật trạng thái
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => handlePageChange(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={
                      currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Dialog xác nhận đổi trạng thái */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận cập nhật trạng thái</DialogTitle>
              <DialogDescription>
                Bạn có chắc muốn cập nhật trạng thái đơn hàng{" "}
                <span className="font-semibold">#{selectedOrder?. _id}</span> từ{" "}
                <span className="font-semibold">{getStatusLabel(selectedOrder?.status)}</span> sang trạng thái tiếp theo?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-gray-300"
              >
                Hủy
              </Button>
              <Button
                onClick={handleStatusChange}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUpdating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Xác nhận
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
