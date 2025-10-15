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
const mockRestaurants = [
  {
    _id: "1",
    name: "Nhà hàng Á Đông",
    address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    cuisine: "Asian",
    status: "OPEN",
    rating: 4.5,
    createdAt: "2025-10-01T10:00:00Z",
  },
  {
    _id: "2",
    name: "Bistro Pháp",
    address: "456 Đường Nguyễn Huệ, Quận 1, TP.HCM",
    cuisine: "French",
    status: "CLOSED",
    rating: 4.2,
    createdAt: "2025-10-02T12:00:00Z",
  },
  {
    _id: "3",
    name: "Pizza Hut",
    address: "789 Đường Pasteur, Quận 3, TP.HCM",
    cuisine: "Italian",
    status: "PENDING",
    rating: 4.0,
    createdAt: "2025-10-03T15:00:00Z",
  },
  {
    _id: "4",
    name: "Sushi Bar",
    address: "101 Đường Võ Văn Tần, Quận 3, TP.HCM",
    cuisine: "Japanese",
    status: "OPEN",
    rating: 4.8,
    createdAt: "2025-10-04T09:00:00Z",
  },
  {
    _id: "5",
    name: "Grill House",
    address: "202 Đường Lý Tự Trọng, Quận 1, TP.HCM",
    cuisine: "American",
    status: "CLOSED",
    rating: 4.3,
    createdAt: "2025-10-04T11:00:00Z",
  },
  // Thêm dữ liệu mẫu để kiểm tra phân trang
  ...Array.from({ length: 10 }, (_, i) => ({
    _id: `${i + 6}`,
    name: `Nhà hàng ${i + 6}`,
    address: `Địa chỉ ${i + 6}, Quận 1, TP.HCM`,
    cuisine: ["Asian", "French", "Italian", "Japanese", "American"][i % 5],
    status: ["OPEN", "CLOSED", "PENDING"][i % 3],
    rating: (4.0 + Math.random() * 0.9).toFixed(1),
    createdAt: `2025-10-04T${(i + 10).toString().padStart(2, "0")}:00:00Z`,
  })),
];

// Dữ liệu loại ẩm thực mẫu
const cuisines = [
  { _id: "Asian", name: "Asian" },
  { _id: "French", name: "French" },
  { _id: "Italian", name: "Italian" },
  { _id: "Japanese", name: "Japanese" },
  { _id: "American", name: "American" },
];

export const ShopManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cuisineFilter, setCuisineFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const itemsPerPage = 10;

  // Lọc nhà hàng
  const filteredRestaurants = useMemo(() => {
    return mockRestaurants.filter((restaurant) => {
      const matchesSearch = restaurant.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || restaurant.status === statusFilter;
      const matchesCuisine =
        cuisineFilter === "all" || restaurant.cuisine === cuisineFilter;
      return matchesSearch && matchesStatus && matchesCuisine;
    });
  }, [searchQuery, statusFilter, cuisineFilter]);

  // Phân trang
  const paginatedRestaurants = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRestaurants.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRestaurants, currentPage]);

  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);

  // Reset trang khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, cuisineFilter]);

  // Xử lý đổi trạng thái
  const handleStatusChange = async () => {
    setIsUpdating(true);
    try {
      // Giả lập gọi API
      const newStatus =
        selectedRestaurant.status === "OPEN" ? "CLOSED" : "OPEN";
      // await updateRestaurantStatus(selectedRestaurant._id, newStatus);
      // Cập nhật mock data
      mockRestaurants.find((res) => res._id === selectedRestaurant._id).status =
        newStatus;
      toast.success(
        `Đã cập nhật trạng thái nhà hàng ${selectedRestaurant.name} thành ${newStatus}`
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

  // Lấy tên loại ẩm thực từ cuisine
  const getCuisineName = (cuisineId) => {
    const cuisine = cuisines.find((c) => c._id === cuisineId);
    return cuisine ? cuisine.name : "Unknown";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Danh sách nhà hàng</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm tên nhà hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="OPEN">Mở cửa</SelectItem>
                <SelectItem value="CLOSED">Đóng cửa</SelectItem>
                <SelectItem value="PENDING">Chờ duyệt</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Lọc theo loại ẩm thực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {cuisines.map((cuisine) => (
                  <SelectItem key={cuisine._id} value={cuisine._id}>
                    {cuisine.name}
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
                <TableHead className="font-semibold text-gray-700">Tên nhà hàng</TableHead>
                <TableHead className="font-semibold text-gray-700">Loại ẩm thực</TableHead>
                <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
                <TableHead className="font-semibold text-gray-700">Địa chỉ</TableHead>
                <TableHead className="font-semibold text-gray-700">Đánh giá</TableHead>
                <TableHead className="font-semibold text-gray-700">Created At</TableHead>
                <TableHead className="font-semibold text-gray-700">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRestaurants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Không tìm thấy nhà hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRestaurants.map((restaurant) => (
                  <TableRow key={restaurant._id}>
                    <TableCell className="font-medium">{restaurant.name}</TableCell>
                    <TableCell>{getCuisineName(restaurant.cuisine)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          restaurant.status === "OPEN"
                            ? "bg-green-100 text-green-800"
                            : restaurant.status === "CLOSED"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {restaurant.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{restaurant.address}</TableCell>
                    <TableCell>{restaurant.rating}</TableCell>
                    <TableCell>
                      {new Date(restaurant.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {(restaurant.status === "OPEN" || restaurant.status === "CLOSED") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRestaurant(restaurant);
                            setDialogOpen(true);
                          }}
                          className="border-gray-300 hover:bg-blue-50"
                        >
                          {restaurant.status === "OPEN" ? "Đóng cửa" : "Mở cửa"}
                        </Button>
                      )}
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
              <DialogTitle>Xác nhận đổi trạng thái</DialogTitle>
              <DialogDescription>
                Bạn có chắc muốn đổi trạng thái nhà hàng{" "}
                <span className="font-semibold">{selectedRestaurant?.name}</span> từ{" "}
                <span className="font-semibold">{selectedRestaurant?.status}</span> sang{" "}
                <span className="font-semibold">
                  {selectedRestaurant?.status === "OPEN" ? "CLOSED" : "OPEN"}
                </span>
                ?
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