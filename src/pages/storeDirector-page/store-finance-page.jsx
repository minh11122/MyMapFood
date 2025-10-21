import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  Calendar,
  DollarSign,
  Package,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toast from "react-hot-toast";
import { getRevenueByShop } from "../../services/owner.service";

export const StoreFinancePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [revenueData, setRevenueData] = useState(null);
  const [month, setMonth] = useState(10); // Default to October
  const [year, setYear] = useState(2025); // Default to 2025
  const [ownerId, setOwnerId] = useState(null);

  // Load owner data and fetch revenue on mount and when month/year change
  useEffect(() => {
    const loadOwnerData = () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        toast.error("Không tìm thấy thông tin người dùng");
        return;
      }
      
      const user = JSON.parse(userStr);
      setOwnerId(user._id);
    };

    loadOwnerData();
  }, []);

  useEffect(() => {
    if (ownerId) {
      fetchRevenue();
    }
  }, [ownerId, month, year]);

  const fetchRevenue = async () => {
    setIsLoading(true);
    try {
      const response = await getRevenueByShop(ownerId, month, year);
      if (response.data.success) {
        setRevenueData(response.data.data);
        toast.success(`Đã tải dữ liệu tài chính cho tháng ${month}/${year}`);
      } else {
        toast.error("Không thể tải dữ liệu tài chính");
      }
    } catch (error) {
      console.error("Error fetching revenue:", error);
      toast.error("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu tài chính...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header với thông tin chủ shop */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Tài Chính Cửa Hàng</h1>
            {revenueData?.shop && (
              <p className="text-lg text-gray-700 mb-4">Cửa hàng: {revenueData.shop.name}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <DollarSign className="h-6 w-6 text-blue-600 mb-2" />
                <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(revenueData?.summary?.totalRevenue || 0)} VND
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <Package className="h-6 w-6 text-green-600 mb-2" />
                <p className="text-sm text-gray-600 mb-1">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-green-600">
                  {revenueData?.summary?.totalOrders || 0}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <Package className="h-6 w-6 text-purple-600 mb-2" />
                <p className="text-sm text-gray-600 mb-1">Tổng món bán</p>
                <p className="text-2xl font-bold text-purple-600">
                  {revenueData?.summary?.totalFoodsSold || 0}
                </p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <Users className="h-6 w-6 text-indigo-600 mb-2" />
                <p className="text-sm text-gray-600 mb-1">Khách hàng duy nhất</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {revenueData?.summary?.uniqueCustomers || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-xl font-bold text-gray-900">Chi tiết doanh thu món ăn</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Select value={month.toString()} onValueChange={(value) => setMonth(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Tháng" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Tháng {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Năm" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026].map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                variant="outline"
                onClick={fetchRevenue}
                className="border-gray-300"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Lọc
              </Button>
            </div>
          </div>

          {/* Table chi tiết */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">Tên món ăn</TableHead>
                  <TableHead className="font-semibold text-gray-700">Số lượng bán</TableHead>
                  <TableHead className="font-semibold text-gray-700">Doanh thu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenueData?.foodSales?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                      Không có dữ liệu doanh thu cho tháng này
                    </TableCell>
                  </TableRow>
                ) : (
                  revenueData?.foodSales?.map((sale) => (
                    <TableRow key={sale.foodId}>
                      <TableCell className="font-medium">{sale.foodName}</TableCell>
                      <TableCell>{sale.totalSold}</TableCell>
                      <TableCell>{formatPrice(sale.totalRevenue)} VND</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};