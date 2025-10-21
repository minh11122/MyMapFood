import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { getFoodsByOwner, updateFood } from "../../services/owner.service";

// Schema cho form món ăn
const foodSchema = z.object({
  name: z.string().min(1, "Tên món ăn là bắt buộc"),
  description: z.string().min(1, "Mô tả là bắt buộc"),
  price: z.coerce.number().positive("Giá phải lớn hơn 0"),
  discount: z.coerce.number().min(0).max(100, "Giảm giá phải từ 0-100%"),
  image_url: z.string().url("URL hình ảnh không hợp lệ").optional(),
  is_available: z.boolean(),
});

// Default values
const defaultValues = {
  name: "",
  description: "",
  price: 0,
  discount: 0,
  image_url: "",
  is_available: true,
};

export const OwnerPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // State cho dữ liệu chủ shop
  const [isLoading, setIsLoading] = useState(true);
  const [foods, setFoods] = useState([]);

  // Form cho món ăn
  const form = useForm({
    resolver: zodResolver(foodSchema),
    defaultValues,
  });

  const isEditing = !!selectedFood;

  // Load dữ liệu chủ shop khi component mount
  useEffect(() => {
    const loadOwnerData = async () => {
      try {
        setIsLoading(true);
        
        // Lấy thông tin user từ localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          toast.error("Không tìm thấy thông tin người dùng");
          return;
        }
        
        const user = JSON.parse(userStr);
        const ownerId = user._id;
        
        // Gọi API lấy danh sách foods
        const foodsResponse = await getFoodsByOwner(ownerId);
        
        if (foodsResponse.data.success) {
          setFoods(foodsResponse.data.data || []);
          toast.success(`Đã tải ${foodsResponse.data.data?.length || 0} món ăn`);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    loadOwnerData();
  }, []);

  // Lọc món ăn theo search
  const filteredFoods = useMemo(() => {
    return foods.filter((food) =>
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, foods]);

  // Reset form khi mở dialog
  useEffect(() => {
    if (dialogOpen) {
      if (isEditing) {
        form.reset({
          name: selectedFood.name,
          description: selectedFood.description,
          price: selectedFood.price,
          discount: selectedFood.discount,
          image_url: selectedFood.image_url,
          is_available: selectedFood.is_available,
        });
      } else {
        form.reset(defaultValues);
      }
    }
  }, [dialogOpen, selectedFood, isEditing, form, defaultValues]);

  // Submit form
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let updatedFoods;
      if (isEditing) {
        // Gọi API updateFood
        await updateFood(selectedFood._id, data);
        updatedFoods = foods.map((food) =>
          food._id === selectedFood._id ? { ...food, ...data } : food
        );
        toast.success("Cập nhật món ăn thành công!");
      } else {
        // TODO: Gọi API createFood(data);
        const shopId = foods[0]?.shop_id || ""; // Giả sử sử dụng shop_id từ món ăn đầu tiên
        const newFood = {
          _id: Date.now().toString(), // Fake ID
          shop_id: shopId,
          ...data,
          category_id: { _id: "fake", name: "FOOD" }, // Fake
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: "fake",
        };
        updatedFoods = [...foods, newFood];
        toast.success("Thêm món ăn thành công!");
      }
      setFoods(updatedFoods);
      setDialogOpen(false);
      setSelectedFood(null);
    } catch (error) {
      console.error("Error saving food:", error);
      toast.error(isEditing ? "Không thể cập nhật món ăn." : "Không thể thêm món ăn.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xóa món ăn (Tạm thời local state, TODO: API)
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // TODO: Gọi API deleteFood(selectedFood._id);
      const updatedFoods = foods.filter((food) => food._id !== selectedFood._id);
      setFoods(updatedFoods);
      toast.success("Xóa món ăn thành công!");
      setDeleteDialogOpen(false);
      setSelectedFood(null);
    } catch (error) {
      console.error("Error deleting food:", error);
      toast.error("Không thể xóa món ăn.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Mở edit
  const openEdit = (food) => {
    setSelectedFood(food);
    setDialogOpen(true);
  };

  // Mở delete
  const openDelete = (food) => {
    setSelectedFood(food);
    setDeleteDialogOpen(true);
  };

  // Format giá
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Chủ Cửa Hàng</h1>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Tổng món ăn</p>
                <p className="text-2xl font-bold text-green-600">{foods.length}</p>
              </div>
            </div>
          </div>

          {/* Header quản lý món ăn */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-xl font-bold text-gray-900">Quản lý món ăn</h2>
            <div className="flex gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm tên hoặc mô tả món ăn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700" 
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm món ăn
              </Button>
            </div>
          </div>

          {/* Table món ăn */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">Hình ảnh</TableHead>
                  <TableHead className="font-semibold text-gray-700">Tên món</TableHead>
                  <TableHead className="font-semibold text-gray-700">Giá</TableHead>
                  <TableHead className="font-semibold text-gray-700">Giảm giá</TableHead>
                  <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-gray-700">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFoods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {foods.length === 0 
                        ? "Chưa có món ăn nào. Hãy thêm món ăn đầu tiên!"
                        : "Không tìm thấy món ăn nào phù hợp với tìm kiếm"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFoods.map((food) => (
                    <TableRow 
                      key={food._id}
                      className="cursor-pointer hover:bg-gray-50"
                      onDoubleClick={() => openEdit(food)}
                    >
                      <TableCell>
                        {food.image_url ? (
                          <img 
                            src={food.image_url} 
                            alt={food.name}
                            className="w-20 h-20 rounded object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{food.name}</TableCell>
                      <TableCell>{formatPrice(food.price)} VND</TableCell>
                      <TableCell>{food.discount}%</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            food.is_available
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {food.is_available ? "Có sẵn" : "Hết hàng"}
                        </span>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(food)}
                          className="border-gray-300 hover:bg-blue-50 h-8"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDelete(food)}
                          className="border-red-300 hover:bg-red-50 h-8 text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Dialog thêm/sửa món ăn */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className={isEditing ? "max-w-2xl max-h-[90vh] overflow-y-auto" : "max-w-md"}>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Sửa món ăn" : "Thêm món ăn"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Cập nhật thông tin món ăn." : "Thêm món ăn mới."}
              </DialogDescription>
            </DialogHeader>
            <FormProvider {...form}>
              <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên món ăn</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên món ăn" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Nhập mô tả" {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giá (VND)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="discount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giảm giá (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="is_available"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Có sẵn
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL hình ảnh (tùy chọn)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {isEditing && (
                    <div className="text-sm text-gray-500 space-y-1 pt-4 border-t">
                      <p>Loại: {selectedFood?.category_id?.name || "FOOD"}</p>
                      <p>Ngày tạo: {new Date(selectedFood?.created_at).toLocaleDateString("vi-VN")}</p>
                      <p>Ngày cập nhật: {new Date(selectedFood?.updated_at).toLocaleDateString("vi-VN")}</p>
                      <p>Tạo bởi: {selectedFood?.created_by}</p>
                    </div>
                  )}
                  <DialogFooter className="gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      className="border-gray-300"
                    >
                      Hủy
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {isEditing ? "Cập nhật" : "Thêm"}
                    </Button>
                  </DialogFooter>
                </Form>
            </FormProvider>
          </DialogContent>
        </Dialog>

        {/* Dialog xác nhận xóa */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa món ăn</DialogTitle>
              <DialogDescription>
                Bạn có chắc muốn xóa món ăn "<span className="font-semibold">{selectedFood?.name}</span>"? 
                Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                className="border-gray-300"
              >
                Hủy
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};