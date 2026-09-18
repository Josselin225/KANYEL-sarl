"use client";

import { usePathname } from "@/i18n/navigation";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { AdminThemeProvider } from "@/components/admin/AdminThemeContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return (
      <AdminThemeProvider>
        <div className="min-h-screen bg-admin-bg">{children}</div>
      </AdminThemeProvider>
    );
  }

  return (
    <AdminThemeProvider>
      <AdminAuthGuard>
        <div className="flex h-screen overflow-hidden bg-admin-bg">
          <AdminSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <AdminHeader />
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
          </div>
        </div>
      </AdminAuthGuard>
    </AdminThemeProvider>
  );
}
