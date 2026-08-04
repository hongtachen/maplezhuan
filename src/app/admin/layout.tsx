"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import AdminShell from "@/components/admin/AdminShell";
import AuthModal from "@/components/auth/AuthModal";
import { adminFetch } from "@/lib/admin/client";

type MeResponse = {
  uid: string;
  isAdmin: boolean;
  preApprovalEnabled: boolean;
};

type Verified = {
  uid: string;
  allowed: boolean;
  preApproval: boolean;
  error: string | null;
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [verified, setVerified] = useState<Verified | null>(null);

  useEffect(() => {
    if (!user) return;

    const uid = user.uid;
    let cancelled = false;

    void (async () => {
      try {
        await user.getIdToken(true);
        const me = await adminFetch<MeResponse>("/api/admin/me");
        if (cancelled) return;
        setVerified({
          uid,
          allowed: !!me.isAdmin,
          preApproval: !!me.preApprovalEnabled,
          error: null,
        });
      } catch (e) {
        if (cancelled) return;
        setVerified({
          uid,
          allowed: false,
          preApproval: false,
          error: e instanceof Error ? e.message : "无权限",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#f4f7f5]">
        <div className="w-8 h-8 border-4 border-[#2f9e6d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AuthModal />;
  }

  const ready = verified?.uid === user.uid;
  if (!ready) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#f4f7f5]">
        <div className="w-8 h-8 border-4 border-[#2f9e6d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!verified.allowed) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#f4f7f5] px-6">
        <div className="max-w-sm w-full bg-white rounded-2xl border border-[rgba(31,41,51,0.08)] p-6 text-center shadow-sm">
          <h1 className="text-[18px] font-bold text-[#1f2933]">无权限</h1>
          <p className="mt-2 text-[13px] text-[#5a6b73] leading-relaxed">
            {verified.error ||
              "当前账号没有管理员权限。请联系已有管理员，或将你的 UID 加入 ADMIN_BOOTSTRAP_UIDS。"}
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-5 w-full py-2.5 rounded-xl bg-[#2f9e6d] text-white text-[13px] font-bold hover:bg-[#267a56] transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminShell adminEmail={user.email || undefined}>
      <div data-pre-approval={verified.preApproval ? "true" : "false"}>
        {children}
      </div>
    </AdminShell>
  );
}
