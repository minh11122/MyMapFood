import { useState, useMemo, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Loader2,
  Edit,
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
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

// Dữ liệu mẫu (giả lập từ schema MongoDB)
const mockMenuItems = [
  {
    _id: "1",
    name: "Phở bò",
    category: "Main",
    price: 50000,
    quantity: 50,
    status: "IN_STOCK",
    createdAt: "2025-10-01T10:00:00Z",
  },
  {
    _id: "2",
    name: "Bánh mì thịt nướng",
    category: "Main",
    price: 30000,
    quantity: 20,
    status: "LOW_STOCK",
    createdAt: "2025-10-02T12:00:00Z",
  },
  {
    _id: "3",
    name: "Salad gà",
    category: "Appetizer",
    price: 40000,
    quantity: 0,
    status: "OUT_OF_STOCK",
    createdAt: "2025-10-03T15:00:00Z",
  },
  {
    _id: "4",
    name: "Bánh flan",
    category: "Dessert",
    price: 25000,
    quantity: 30,
    status: "IN_STOCK",
    createdAt: "2025-10-04T09:00:00Z",
  },
  {
    _id: "5",
    name: "Cơm tấm",
    category: "Main",
    price: 45000,
    quantity: 40,
    status: "IN_STOCK",
    createdAt: "2025-10-04T11:00:00Z",
  },
  // Thêm dữ liệu mẫu để kiểm tra phân trang
  ...Array.from({ length: 10 }, (_, i) => ({
    _id: `${i + 6}`,
    name: `Món ăn ${i + 6}`,
    category: ["Appetizer", "Main", "Dessert"][i % 3],
    price: 20000 + (i + 1) * 5000,
    quantity: Math.floor(Math.random() * 100),
    status: Math.random() > 0.7 ? "OUT_OF_STOCK" : Math.random() > 0.5 ? "LOW_STOCK" : "IN_STOCK",
    createdAt: `2025-10-04T${(i + 10).toString().padStart(2, "0")}:00:00Z`,
  })),
];

// Dữ liệu danh mục mẫu
const categories = [
  { value: "Appetizer", label: "Khởi vị" },
  { value: "Main", label: "Món chính" },
  { value: "Dessert", label: "Tráng miệng" },
];

// Dữ liệu trạng thái tồn kho
const stockStatuses = [
  { value: "IN_STOCK", label: "Có hàng" },
  { value: "LOW_STOCK", label: "Hết hàng sắp" },
  { value: "OUT_OF_STOCK", label: "Hết hàng" },
];

export const MenuStockManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const itemsPerPage = 10;

  // Lọc món ăn
  const filteredItems = useMemo(() => {
    return mockMenuItems.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, categoryFilter, statusFilter]);

  // Phân trang
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Reset trang khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, statusFilter]);

  // Xử lý cập nhật số lượng
  const handleQuantityUpdate = async () => {
    if (newQuantity < 0) {
      toast.error("Số lượng không thể âm.");
      return;
    }
    setIsUpdating(true);
    try {
      // Giả lập gọi API
      // await updateMenuItemQuantity(selectedItem._id, newQuantity);
      // Cập nhật mock data
      const item = mockMenuItems.find((it) => it._id === selectedItem._id);
      if (item) {
        item.quantity = newQuantity;
        item.status = newQuantity > 10 ? "IN_STOCK" : newQuantity > 0 ? "LOW_STOCK" : "OUT_OF_STOCK";
      }
      toast.success(
        `Đã cập nhật số lượng món ${selectedItem.name} thành ${newQuantity}`
      );
      setDialogOpen(false);
      setNewQuantity(0);
    } catch (error) {
      toast.error("Không thể cập nhật số lượng. Vui lòng thử lại.");
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

  // Lấy label danh mục
  const getCategoryLabel = (category) => {
    const cat = categories.find((c) => c.value === category);
    return cat ? cat.label : category;
  };

  // Lấy label trạng thái
  const getStatusLabel = (status) => {
    const stat = stockStatuses.find((s) => s.value === status);
    return stat ? stat.label : status;
  };

  // Lấy class cho trạng thái
  const getStatusClass = (status) => {
    switch (status) {
      case "IN_STOCK":
        return "bg-green-100 text-green-800";
      case "LOW_STOCK":
        return "bg-yellow-100 text-yellow-800";
      case "OUT_OF_STOCK":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tồn kho món ăn</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm tên món ăn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Lọc theo danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {stockStatuses.map((stat) => (
                  <SelectItem key={stat.value} value={stat.value}>
                    {stat.label}
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
                <TableHead className="font-semibold text-gray-700">Tên món</TableHead>
                <TableHead className="font-semibold text-gray-700">Danh mục</TableHead>
                <TableHead className="font-semibold text-gray-700">Giá</TableHead>
                <TableHead className="font-semibold text-gray-700">Số lượng hiện tại</TableHead>
                <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
                <TableHead className="font-semibold text-gray-700">Created At</TableHead>
                <TableHead className="font-semibold text-gray-700">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Không tìm thấy món ăn nào
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{getCategoryLabel(item.category)}</TableCell>
                    <TableCell>{item.price.toLocaleString()} VND</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(item.status)}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setNewQuantity(item.quantity);
                          setDialogOpen(true);
                        }}
                        className="border-gray-300 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Cập nhật
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

        {/* Dialog cập nhật số lượng */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cập nhật số lượng món ăn</DialogTitle>
              <DialogDescription>
                Cập nhật số lượng cho món{" "}
                <span className="font-semibold">{selectedItem?.name}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Số lượng:
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value))}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-gray-300">
                  Hủy
                </Button>
              </DialogClose>
              <Button
                onClick={handleQuantityUpdate}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUpdating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Cập nhật
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};