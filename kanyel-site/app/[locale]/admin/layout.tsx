"use client";

import { usePathname } from "@/i18n/navigation";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <div className="min-h-screen bg-bg">{children}</div>;
  }

  return (
    <AdminAuthGuard>
      <div className="flex h-screen overflow-hidden bg-bg-alt">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
