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
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { listAccounts, updateAccountAndUser } from "@/services/admin.service"; // Giả sử đường dẫn service đúng

// Dữ liệu role mẫu
const roles = [
  { _id: "68e44bdbd727678bb423310c", name: "ADMIN" },
  { _id: "68e44bdbd727678bb4233108", name: "CUSTOMER" },
  { _id: "68e44bdbd727678bb4233109", name: "SELLER_STAFF" },
];

export const AccountManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [editFullName, setEditFullName] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [isUpdating, setIsUpdating] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 10;

  // Fetch accounts từ API
  const fetchAccounts = async (page = 1, search = "", role = "all", status = "all") => {
    setLoading(true);
    try {
      const params = {
        page,
        ...(search && { search }),
        ...(role !== "all" && { role }),
        ...(status !== "all" && { status }),
      };
      const response = await listAccounts(params);
      setAccounts(response.data.accounts || []);
      setTotalPages(response.data.totalPages || 1);
      if (page === 1) {
        setCurrentPage(1);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách tài khoản. Vui lòng thử lại.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Load ban đầu
  useEffect(() => {
    fetchAccounts(currentPage, searchQuery, roleFilter, statusFilter);
  }, [currentPage, searchQuery, roleFilter, statusFilter]);

  // Lọc và phân trang dựa trên API (API đã xử lý filter và paginate)
  const paginatedAccounts = useMemo(() => accounts, [accounts]);

  // Reset trang khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, roleFilter]);

  // Xử lý đổi trạng thái (confirmation dialog)
  const handleStatusChange = async () => {
    setIsUpdating(true);
    try {
      const newStatus = selectedAccount.status === "ACTIVE" ? "PENDING" : "ACTIVE";
      await updateAccountAndUser(selectedAccount._id, { status: newStatus });
      // Cập nhật local state
      setAccounts((prev) =>
        prev.map((acc) =>
          acc._id === selectedAccount._id ? { ...acc, status: newStatus } : acc
        )
      );
      toast.success(
        `Đã cập nhật trạng thái tài khoản ${selectedAccount.user?.full_name || selectedAccount.email} thành ${newStatus}`
      );
      setDialogOpen(false);
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái. Vui lòng thử lại.");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Xử lý cập nhật đầy đủ (edit dialog)
  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const data = {};
      const originalFullName = selectedAccount.user?.full_name || "";
      const originalStatus = selectedAccount.status;

      if (editFullName !== originalFullName) {
        data.full_name = editFullName;
      }
      if (editStatus !== originalStatus) {
        data.status = editStatus;
      }

      if (Object.keys(data).length === 0) {
        toast.info("Không có thay đổi nào.");
        setEditDialogOpen(false);
        return;
      }

      await updateAccountAndUser(selectedAccount._id, data);
      // Cập nhật local state
      setAccounts((prev) =>
        prev.map((acc) =>
          acc._id === selectedAccount._id
            ? {
                ...acc,
                status: data.status || acc.status,
                user: {
                  ...acc.user,
                  full_name: data.full_name || acc.user.full_name,
                },
              }
            : acc
        )
      );
      toast.success("Cập nhật thành công!");
      setEditDialogOpen(false);
    } catch (error) {
      toast.error("Không thể cập nhật. Vui lòng thử lại.");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchAccounts(page, searchQuery, roleFilter, statusFilter);
    }
  };

  // Lấy tên role
  const getRoleName = (roleId) => {
    const role = roles.find((r) => r._id === roleId?._id);
    return role ? role.name : "Unknown";
  };

  // Badge cho email verified
  const getVerifiedBadge = (verified) => {
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          verified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {verified ? "Đã xác thực" : "Chưa xác thực"}
      </span>
    );
  };

  // Badge cho status
  const getStatusBadge = (status) => {
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === "ACTIVE"
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading && accounts.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Danh sách tài khoản</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm email hoặc tên..."
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
                <SelectItem value="PENDING">Chờ kích hoạt</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Lọc theo vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role._id} value={role._id}>
                    {role.name}
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
                <TableHead className="font-semibold text-gray-700">Email</TableHead>
                <TableHead className="font-semibold text-gray-700">Tên đầy đủ</TableHead>
                <TableHead className="font-semibold text-gray-700">Vai trò</TableHead>
                <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
                <TableHead className="font-semibold text-gray-700">Xác thực email</TableHead>
                <TableHead className="font-semibold text-gray-700">Số điện thoại</TableHead>
                <TableHead className="font-semibold text-gray-700">Created At</TableHead>
                <TableHead className="font-semibold text-gray-700">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Không tìm thấy tài khoản nào
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAccounts.map((account) => (
                  <TableRow 
                    key={account._id}
                    className="cursor-pointer hover:bg-gray-50"
                    onDoubleClick={() => {
                      setSelectedAccount(account);
                      setEditFullName(account.user?.full_name || "");
                      setEditStatus(account.status);
                      setEditDialogOpen(true);
                    }}
                  >
                    <TableCell className="font-medium">{account.email}</TableCell>
                    <TableCell>{account.user?.full_name || "N/A"}</TableCell>
                    <TableCell>{getRoleName(account.role_id)}</TableCell>
                    <TableCell>{getStatusBadge(account.status)}</TableCell>
                    <TableCell>{getVerifiedBadge(account.email_verified)}</TableCell>
                    <TableCell className="text-sm text-gray-500">{account.user?.phone || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(account.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {account.status === "ACTIVE" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAccount(account);
                            setDialogOpen(true);
                          }}
                          className="border-gray-300 hover:bg-blue-50"
                        >
                          Deactivate
                        </Button>
                      )}
                      {account.status === "PENDING" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAccount(account);
                            setDialogOpen(true);
                          }}
                          className="border-gray-300 hover:bg-blue-50"
                        >
                          Activate
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
                Bạn có chắc muốn đổi trạng thái tài khoản{" "}
                <span className="font-semibold">{selectedAccount?.user?.full_name || selectedAccount?.email}</span> từ{" "}
                <span className="font-semibold">{selectedAccount?.status}</span> sang{" "}
                <span className="font-semibold">
                  {selectedAccount?.status === "ACTIVE" ? "PENDING" : "ACTIVE"}
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

        {/* Dialog chỉnh sửa đầy đủ */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa thông tin tài khoản</DialogTitle>
              <DialogDescription>
                Cập nhật tên đầy đủ và trạng thái cho tài khoản{" "}
                <span className="font-semibold">{selectedAccount?.email}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Tên đầy đủ</Label>
                <Input
                  id="fullName"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Nhập tên đầy đủ"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                    <SelectItem value="PENDING">Chờ kích hoạt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="border-gray-300"
              >
                Hủy
              </Button>
              <Button
                onClick={handleUpdate}
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