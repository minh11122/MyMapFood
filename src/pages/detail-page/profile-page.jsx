import { useEffect, useState } from "react";
import { MapPin, User, Loader2, Edit2, Save, Mail, Phone } from "lucide-react";
import { getUserProfile } from "@/services/customer.service.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      fetchUserProfile(parsedUser._id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const res = await getUserProfile(userId);
      setProfile(res);
      setEditedData({
        full_name: res.user?.full_name || "",
        phone: res.user?.phone || "",
        email: res.account?.email || "",
      });
    } catch (error) {
      console.error("Lỗi khi lấy hồ sơ người dùng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => setEditMode(!editMode);
  const handleSave = () => {
    console.log("Dữ liệu cập nhật:", editedData);
    setEditMode(false);
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
          <span className="text-sm text-muted-foreground">
            Đang tải thông tin...
          </span>
        </div>
      </div>
    );

  if (!profile)
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md border-0 shadow-sm">
          <div className="flex flex-col items-center px-8 py-16 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              Chưa đăng nhập
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Vui lòng đăng nhập để xem thông tin cá nhân.
            </p>
            <Button className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground">
              Đăng nhập ngay
            </Button>
          </div>
        </Card>
      </div>
    );

  const { account, user, addresses } = profile;
  const defaultAddress = addresses?.find((a) => a.isDefault) || addresses?.[0];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        {/* <div className="mb-12">
          <h1 className="text-3xl font-serif font-semibold text-foreground text-balance">
            Hồ sơ cá nhân
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Quản lý thông tin và địa chỉ giao hàng của bạn
          </p>
        </div> */}

        {/* Personal Information Card */}
        <Card className="mb-8 border-0 shadow-sm overflow-hidden">
          <div className="border-b border-border bg-card px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <User className="h-5 w-5 text-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Thông tin cá nhân
                </h2>
              </div>
              <Button
                onClick={editMode ? handleSave : handleEditToggle}
                variant={editMode ? "default" : "outline"}
                size="sm"
                className={`gap-2 ${
                  editMode
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "border-border hover:bg-secondary"
                }`}
              >
                {editMode ? (
                  <>
                    <Save className="h-4 w-4" /> Lưu
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4" /> Chỉnh sửa
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="px-8 py-8">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  Họ và tên
                </label>
                {editMode ? (
                  <Input
                    value={editedData.full_name}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        full_name: e.target.value,
                      })
                    }
                    className="border-border bg-background"
                  />
                ) : (
                  <p className="text-base font-medium text-foreground">
                    {user?.full_name || "Chưa cập nhật"}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  Số điện thoại
                </label>
                {editMode ? (
                  <Input
                    value={editedData.phone}
                    onChange={(e) =>
                      setEditedData({ ...editedData, phone: e.target.value })
                    }
                    className="border-border bg-background"
                  />
                ) : (
                  <p className="text-base font-medium text-foreground">
                    {user?.phone || "Chưa có số điện thoại"}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-3 md:col-span-2">
                <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </label>
                {editMode ? (
                  <Input
                    value={editedData.email}
                    onChange={(e) =>
                      setEditedData({ ...editedData, email: e.target.value })
                    }
                    className="border-border bg-background"
                  />
                ) : (
                  <p className="text-base font-medium text-foreground">
                    {account?.email || "Chưa có email"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Shipping Address Card */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="border-b border-border bg-card px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <MapPin className="h-5 w-5 text-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Địa chỉ giao hàng
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-border hover:bg-secondary bg-transparent"
                onClick={() => console.log("Thêm địa chỉ mới")}
              >
                <MapPin className="h-4 w-4" />
                Thêm địa chỉ
              </Button>
            </div>
          </div>

          <div className="px-8 py-8">
            {defaultAddress ? (
              <div className="rounded-lg border border-accent/20 bg-accent/5 p-6">
                <Badge className="mb-4 bg-accent text-accent-foreground border-0">
                  Địa chỉ mặc định
                </Badge>
                <p className="text-base font-medium leading-relaxed text-foreground">
                  {defaultAddress.address.street}, {defaultAddress.address.ward}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {defaultAddress.address.district},{" "}
                  {defaultAddress.address.city},{" "}
                  {defaultAddress.address.province}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center rounded-lg border-2 border-dashed border-border bg-secondary/30 px-8 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                  <MapPin className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Chưa có địa chỉ giao hàng
                </p>
                <Button className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Thêm địa chỉ đầu tiên
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
