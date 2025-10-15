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
const mockAccounts = [
  {
    _id: "1",
    email: "user1@example.com",
    provider: "local",
    status: "ACTIVE",
    role_id: "admin",
    createdAt: "2025-10-01T10:00:00Z",
  },
  {
    _id: "2",
    email: "user2@example.com",
    provider: "google",
    status: "INACTIVE",
    role_id: "user",
    createdAt: "2025-10-02T12:00:00Z",
  },
  {
    _id: "3",
    email: "editor@example.com",
    provider: "local",
    status: "PENDING",
    role_id: "editor",
    createdAt: "2025-10-03T15:00:00Z",
  },
  {
    _id: "4",
    email: "banned@example.com",
    provider: "local",
    status: "BANNED",
    role_id: "user",
    createdAt: "2025-10-04T09:00:00Z",
  },
  {
    _id: "5",
    email: "admin@example.com",
    provider: "google",
    status: "ACTIVE",
    role_id: "admin",
    createdAt: "2025-10-04T11:00:00Z",
  },
  // Thêm dữ liệu mẫu để kiểm tra phân trang
  ...Array.from({ length: 10 }, (_, i) => ({
    _id: `${i + 6}`,
    email: `user${i + 6}@example.com`,
    provider: i % 2 === 0 ? "local" : "google",
    status: ["ACTIVE", "INACTIVE", "PENDING", "BANNED"][i % 4],
    role_id: ["user", "editor", "admin"][i % 3],
    createdAt: `2025-10-04T${(i + 10).toString().padStart(2, "0")}:00:00Z`,
  })),
];

// Dữ liệu vai trò mẫu
const roles = [
  { _id: "admin", name: "Admin" },
  { _id: "user", name: "User" },
  { _id: "editor", name: "Editor" },
];

export const AccountManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const itemsPerPage = 10;

  // Lọc tài khoản
  const filteredAccounts = useMemo(() => {
    return mockAccounts.filter((account) => {
      const matchesSearch = account.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || account.status === statusFilter;
      const matchesRole =
        roleFilter === "all" || account.role_id === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [searchQuery, statusFilter, roleFilter]);

  // Phân trang
  const paginatedAccounts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAccounts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAccounts, currentPage]);

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  // Reset trang khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, roleFilter]);

  // Xử lý đổi trạng thái
  const handleStatusChange = async () => {
    setIsUpdating(true);
    try {
      // Giả lập gọi API
      const newStatus =
        selectedAccount.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      // await updateAccountStatus(selectedAccount._id, newStatus);
      // Cập nhật mock data
      mockAccounts.find((acc) => acc._id === selectedAccount._id).status =
        newStatus;
      toast.success(
        `Đã cập nhật trạng thái tài khoản ${selectedAccount.email} thành ${newStatus}`
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

  // Lấy tên vai trò từ role_id
  const getRoleName = (roleId) => {
    const role = roles.find((r) => r._id === roleId);
    return role ? role.name : "Unknown";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tài khoản</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm email..."
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
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="BANNED">Banned</SelectItem>
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
                <TableHead className="font-semibold text-gray-700">Provider</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Role</TableHead>
                <TableHead className="font-semibold text-gray-700">Created At</TableHead>
                <TableHead className="font-semibold text-gray-700">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Không tìm thấy tài khoản nào
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAccounts.map((account) => (
                  <TableRow key={account._id}>
                    <TableCell className="font-medium">{account.email}</TableCell>
                    <TableCell>{account.provider}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          account.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : account.status === "INACTIVE"
                            ? "bg-gray-100 text-gray-800"
                            : account.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {account.status}
                      </span>
                    </TableCell>
                    <TableCell>{getRoleName(account.role_id)}</TableCell>
                    <TableCell>
                      {new Date(account.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {(account.status === "ACTIVE" || account.status === "INACTIVE") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAccount(account);
                            setDialogOpen(true);
                          }}
                          className="border-gray-300 hover:bg-blue-50"
                        >
                          {account.status === "ACTIVE" ? "Deactivate" : "Activate"}
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
                <span className="font-semibold">{selectedAccount?.email}</span> từ{" "}
                <span className="font-semibold">{selectedAccount?.status}</span> sang{" "}
                <span className="font-semibold">
                  {selectedAccount?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"}
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
