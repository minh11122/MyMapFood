import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { listShops, updateShop } from "@/services/admin.service";

export const ShopManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [shopsData, setShopsData] = useState({ shops: [], totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Reset trang khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Set form data when opening edit dialog
  useEffect(() => {
    if (selectedShop && editDialogOpen) {
      setEditForm({
        name: selectedShop.name || "",
        description: selectedShop.description || "",
        address: selectedShop.address || { street: "", ward: "", district: "", city: "", province: "" },
        phone: selectedShop.phone || "",
        status: selectedShop.status || "ACTIVE",
        img: selectedShop.img || "",
      });
    }
  }, [selectedShop, editDialogOpen]);

  // Fetch shops từ adminService
  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          search: searchQuery,
          status: statusFilter === "all" ? "" : statusFilter,
        };
        const data = await listShops(params);
        setShopsData(data);
      } catch (error) {
        console.error("Error fetching shops:", error);
        toast.error("Không thể tải danh sách cửa hàng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [currentPage, searchQuery, statusFilter]);

  // Xử lý đổi trạng thái
  const handleStatusChange = async () => {
    setIsUpdating(true);
    try {
      const newStatus = selectedShop.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await updateShopStatus(selectedShop._id, newStatus);
      toast.success(
        `Đã cập nhật trạng thái cửa hàng ${selectedShop.name} thành ${newStatus}`
      );
      setDialogOpen(false);
      // Refetch để cập nhật dữ liệu
      const params = {
        page: currentPage,
        search: searchQuery,
        status: statusFilter === "all" ? "" : statusFilter,
      };
      const data = await listShops(params);
      setShopsData(data);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Không thể cập nhật trạng thái. Vui lòng thử lại.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Xử lý update shop
  const handleUpdateShop = async (e) => {
    e.preventDefault();
    setIsEditing(true);
    try {
      const updateData = {
        name: editForm.name,
        description: editForm.description,
        address: editForm.address,
        phone: editForm.phone,
        status: editForm.status,
        img: editForm.img,
      };
      await updateShop(selectedShop._id, updateData);
      toast.success("Đã cập nhật thông tin cửa hàng thành công");
      setEditDialogOpen(false);
      // Refetch để cập nhật dữ liệu
      const params = {
        page: currentPage,
        search: searchQuery,
        status: statusFilter === "all" ? "" : statusFilter,
      };
      const data = await listShops(params);
      setShopsData(data);
    } catch (error) {
      console.error("Error updating shop:", error);
      toast.error("Không thể cập nhật thông tin. Vui lòng thử lại.");
    } finally {
      setIsEditing(false);
    }
  };

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    if (page >= 1 && page <= shopsData.totalPages) {
      setCurrentPage(page);
    }
  };

  const shops = shopsData.shops || [];

  const formatAddress = (address) => {
    return `${address.street || ""}, ${address.ward || ""}, ${address.district || ""}, ${address.city || ""}`;
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (subfield, value) => {
    setEditForm(prev => ({
      ...prev,
      address: { ...prev.address, [subfield]: value }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Danh sách cửa hàng</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm tên cửa hàng..."
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
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-gray-700">Tên cửa hàng</TableHead>
                <TableHead className="font-semibold text-gray-700">Địa chỉ</TableHead>
                <TableHead className="font-semibold text-gray-700">Số điện thoại</TableHead>
                <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
                <TableHead className="font-semibold text-gray-700">Hình ảnh</TableHead>
                <TableHead className="font-semibold text-gray-700">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Không tìm thấy cửa hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                shops.map((shop) => (
                  <TableRow 
                    key={shop._id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onDoubleClick={() => {
                      setSelectedShop(shop);
                      setEditDialogOpen(true);
                    }}
                  >
                    <TableCell className="font-medium">{shop.name}</TableCell>
                    <TableCell className="text-sm text-gray-500">{formatAddress(shop.address)}</TableCell>
                    <TableCell className="text-sm">{shop.phone}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          shop.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {shop.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <img
                        src={shop.img}
                        alt={shop.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>
                      {(shop.status === "ACTIVE" || shop.status === "INACTIVE") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedShop(shop);
                            setDialogOpen(true);
                          }}
                          className="border-gray-300 hover:bg-blue-50"
                        >
                          {shop.status === "ACTIVE" ? "Tắt hoạt động" : "Kích hoạt"}
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
        {shopsData.totalPages > 1 && (
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
                {Array.from({ length: shopsData.totalPages }, (_, i) => i + 1).map((page) => (
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
                      currentPage === shopsData.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
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
                Bạn có chắc muốn đổi trạng thái cửa hàng{" "}
                <span className="font-semibold">{selectedShop?.name}</span> từ{" "}
                <span className="font-semibold">{selectedShop?.status}</span> sang{" "}
                <span className="font-semibold">
                  {selectedShop?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"}
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

        {/* Dialog chỉnh sửa shop */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa cửa hàng: {selectedShop?.name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateShop} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên cửa hàng</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <div className="space-y-2">
                  <Input
                    placeholder="Số phố, đường"
                    value={editForm.address?.street || ""}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                  />
                  <Input
                    placeholder="Phường/Xã"
                    value={editForm.address?.ward || ""}
                    onChange={(e) => handleAddressChange('ward', e.target.value)}
                  />
                  <Input
                    placeholder="Quận/Huyện"
                    value={editForm.address?.district || ""}
                    onChange={(e) => handleAddressChange('district', e.target.value)}
                  />
                  <Input
                    placeholder="Thành phố"
                    value={editForm.address?.city || ""}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                  />
                  <Input
                    placeholder="Tỉnh/Thành"
                    value={editForm.address?.province || ""}
                    onChange={(e) => handleAddressChange('province', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <Select value={editForm.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                    <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL hình ảnh</label>
                <Input
                  value={editForm.img}
                  onChange={(e) => handleInputChange('img', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="text-sm text-gray-500">
                <p>Đánh giá: {selectedShop?.rating || 0}</p>
                <p>Ngày tạo: {new Date(selectedShop?.createdAt).toLocaleDateString("vi-VN")}</p>
                {selectedShop?.owner && (
                  <p>Chủ sở hữu: {selectedShop.owner.full_name}</p>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  className="border-gray-300"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isEditing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isEditing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang cập nhật
                    </>
                  ) : (
                    "Cập nhật"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};