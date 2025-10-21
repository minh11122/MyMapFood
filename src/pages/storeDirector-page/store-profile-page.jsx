import { useState, useEffect } from "react";
import { Loader2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { getShopProfile } from "../../services/owner.service";

// Schema cho form cập nhật shop
const shopSchema = z.object({
  name: z.string().min(1, "Tên quán là bắt buộc"),
  description: z.string().min(1, "Mô tả là bắt buộc"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  address: z.object({
    street: z.string().min(1, "Địa chỉ đường là bắt buộc"),
    ward: z.string().min(1, "Phường/Xã là bắt buộc"),
    district: z.string().min(1, "Quận/Huyện là bắt buộc"),
    city: z.string().min(1, "Tỉnh/Thành phố là bắt buộc"),
  }),
  img: z.string().url("URL hình ảnh không hợp lệ").optional(),
});

export const StoreProfilePage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State cho dữ liệu shop
  const [shopData, setShopData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form cho shop
  const form = useForm({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      name: "",
      description: "",
      phone: "",
      address: {
        street: "",
        ward: "",
        district: "",
        city: "",
      },
      img: "",
    },
  });

  // Load dữ liệu shop khi component mount
  useEffect(() => {
    const loadShopData = async () => {
      try {
        setIsLoading(true);

        // Lấy thông tin user từ localStorage
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          toast.error("Không tìm thấy thông tin người dùng");
          return;
        }

        const user = JSON.parse(userStr);
        const ownerId = user._id;

        // Gọi API lấy thông tin shop
        const response = await getShopProfile(ownerId);

        if (response.data && response.data.data) {
          const shop = response.data.data;

          setShopData(shop);

          // Set form values
          form.reset({
            name: shop.name || "",
            description: shop.description || "",
            phone: shop.phone || "",
            address: {
              street: shop.address?.street || "",
              ward: shop.address?.ward || "",
              district: shop.address?.district || "",
              city: shop.address?.city || "",
            },
            img: shop.img || "",
          });

          toast.success("Đã tải thông tin quán thành công");
        } else {
          toast.error("Không tìm thấy thông tin quán");
        }
      } catch (error) {
        console.error("Error loading shop data:", error);
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    loadShopData();
  }, [form]);

  // Submit form cập nhật
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Lấy thông tin user từ localStorage
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        toast.error("Không tìm thấy thông tin người dùng");
        return;
      }

      const user = JSON.parse(userStr);
      const ownerId = user._id;

      // Gọi API cập nhật shop
      const response = await updateShopProfile(ownerId, data);

      if (response.data.success) {
        setShopData({ ...shopData, ...data });
        toast.success("Cập nhật thông tin quán thành công!");
        setDialogOpen(false);
      } else {
        toast.error("Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Error updating shop:", error);
      toast.error("Không thể cập nhật thông tin. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mở dialog edit
  const openEdit = () => {
    setDialogOpen(true);
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Dashboard Chủ Cửa Hàng
          </h1>

          {/* Thông tin quán hiện tại */}
          {shopData && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Thông tin quán
                </h2>
                <Button
                  variant="outline"
                  onClick={openEdit}
                  className="border-gray-300 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Sửa thông tin
                </Button>
              </div>

              {shopData.img && (
                <img
                  src={shopData.img}
                  alt={shopData.name}
                  className="w-full h-48 rounded-lg object-cover mb-4"
                />
              )}

              <div className="space-y-2">
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Tên quán:
                  </Label>
                  <p className="text-lg font-semibold">{shopData.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Mô tả:
                  </Label>
                  <p>{shopData.description}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Số điện thoại:
                  </Label>
                  <p>{shopData.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Địa chỉ:
                  </Label>
                  <p>
                    {shopData.address?.street}, {shopData.address?.ward},{" "}
                    {shopData.address?.district}, {shopData.address?.city}
                  </p>
                </div>
                {shopData.status && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Trạng thái:
                    </Label>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        shopData.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {shopData.status}
                    </span>
                  </div>
                )}
                {shopData.rating && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Đánh giá:
                    </Label>
                    <p>⭐ {shopData.rating}/5</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dialog cập nhật thông tin */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cập nhật thông tin quán</DialogTitle>
              <DialogDescription>
                Thay đổi thông tin quán của bạn.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên quán</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên quán" {...field} />
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
                        <Textarea placeholder="Nhập mô tả quán" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập số điện thoại" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <Label>Địa chỉ</Label>
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Đường</FormLabel>
                        <FormControl>
                          <Input placeholder="Số nhà, đường" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="address.ward"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="sr-only">Phường/Xã</FormLabel>
                          <FormControl>
                            <Input placeholder="Phường/Xã" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="sr-only">Quận/Huyện</FormLabel>
                          <FormControl>
                            <Input placeholder="Quận/Huyện" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">
                          Tỉnh/Thành phố
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Tỉnh/Thành phố" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="img"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL hình ảnh (tùy chọn)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="border-gray-300"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Cập nhật
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
