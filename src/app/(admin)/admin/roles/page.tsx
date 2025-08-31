"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminRolesPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const _userRole = (session?.user as { role?: string })?.role;

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/roles");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
      } else {
        toast.error("사용자 목록을 불러오는데 실패했습니다.");
      }
    } catch (_error) {
      toast.error("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch("/api/admin/roles", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        const _data = await response.json();
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );
        toast.success("사용자 권한이 업데이트되었습니다.");
      } else {
        const error = await response.json();
        toast.error(error.error || "권한 업데이트에 실패했습니다.");
      }
    } catch (_error) {
      toast.error("오류가 발생했습니다.");
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "default";
      case "OPERATOR":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "관리자";
      case "OPERATOR":
        return "운영자";
      default:
        return "일반사용자";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">권한 관리</h1>
        <p className="text-muted-foreground">
          사용자 권한을 ADMIN 또는 OPERATOR로 설정할 수 있습니다.
        </p>
      </div>

      <Separator className="my-6" />

      {/* Users List */}
      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-medium">
                        {user.name || "이름 없음"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                    {!user.isActive && (
                      <Badge variant="destructive">비활성화</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    가입일: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Select
                    value={user.role}
                    onValueChange={(value) => updateUserRole(user.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">일반사용자</SelectItem>
                      <SelectItem value="OPERATOR">운영자</SelectItem>
                      <SelectItem value="ADMIN">관리자</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">등록된 사용자가 없습니다.</p>
        </div>
      )}

      {/* Stats */}
      <div className="mt-8">
        <Separator className="my-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">총 사용자</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {users.filter((u) => u.role === "ADMIN").length}
              </div>
              <p className="text-xs text-muted-foreground">관리자</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {users.filter((u) => u.role === "OPERATOR").length}
              </div>
              <p className="text-xs text-muted-foreground">운영자</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {users.filter((u) => u.role === "USER").length}
              </div>
              <p className="text-xs text-muted-foreground">일반사용자</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
