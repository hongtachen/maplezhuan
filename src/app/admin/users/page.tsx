"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { adminFetch } from "@/lib/admin/client";
import { PRE_APPROVAL_ENABLED } from "@/lib/moderation/config";
import { useApp } from "@/components/app/AppContext";
import { useAuthStore } from "@/store/useAuthStore";
import StatusBadge from "@/components/admin/StatusBadge";
import AdminDetailDrawer from "@/components/admin/AdminDetailDrawer";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

type AdminUser = {
  uid: string;
  email: string;
  nickname: string;
  avatarUrl: string;
  isVerifiedSeller: boolean;
  sellerStatus: string;
  isSuspended: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  wechat: string;
  phone: string;
};

export default function AdminUsersPage() {
  const { showToast } = useApp();
  const { user: me } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [adminCount, setAdminCount] = useState(0);
  const [viewerIsSuperAdmin, setViewerIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "pending" | "admin" | "suspended"
  >("all");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<null | {
    kind: "suspend" | "revokeSeller" | "setAdmin" | "unsetAdmin";
  }>(null);
  const [edit, setEdit] = useState({
    nickname: "",
    wechat: "",
    phone: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (filter === "pending") params.set("sellerStatus", "pending");
      if (filter === "admin") params.set("isAdmin", "true");
      if (filter === "suspended") params.set("isSuspended", "true");
      const data = await adminFetch<{
        users: AdminUser[];
        adminCount: number;
        viewerIsSuperAdmin: boolean;
      }>(`/api/admin/users?${params.toString()}`);
      setUsers(data.users);
      setAdminCount(data.adminCount ?? 0);
      setViewerIsSuperAdmin(!!data.viewerIsSuperAdmin);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setLoading(false);
    }
  }, [filter, search, showToast]);

  useEffect(() => {
    const t = setTimeout(() => {
      void load();
    }, 200);
    return () => clearTimeout(t);
  }, [load]);

  const openUser = (u: AdminUser) => {
    setSelected(u);
    setEdit({
      nickname: u.nickname || "",
      wechat: u.wechat || "",
      phone: u.phone || "",
    });
  };

  const chips = useMemo(() => {
    const base: { id: typeof filter; label: string }[] = [
      { id: "all", label: "全部" },
      { id: "admin", label: "管理员" },
      { id: "suspended", label: "已封禁" },
    ];
    if (PRE_APPROVAL_ENABLED) {
      base.splice(1, 0, { id: "pending", label: "待审核卖家" });
    }
    return base;
  }, []);

  const isLastAdmin = !!selected?.isAdmin && adminCount <= 1;
  const targetIsProtectedSuper =
    !!selected?.isSuperAdmin && !viewerIsSuperAdmin;
  const cannotRevokeAdmin =
    !!selected?.isAdmin &&
    (isLastAdmin ||
      me?.uid === selected.uid ||
      targetIsProtectedSuper ||
      !!selected.isSuperAdmin);

  const cannotAlterUser = targetIsProtectedSuper;

  const runConfirm = async () => {
    if (!selected || !confirm) return;
    if (confirm.kind === "unsetAdmin" && cannotRevokeAdmin) {
      showToast(
        isLastAdmin
          ? "无法更改：这是最后一位管理员。请先将管理员权限授予其他用户。"
          : "不能撤销自己的管理员权限",
        "error",
      );
      setConfirm(null);
      return;
    }
    setBusy(true);
    try {
      if (confirm.kind === "setAdmin" || confirm.kind === "unsetAdmin") {
        const res = await adminFetch<{ message: string }>(
          "/api/admin/users/set-admin",
          {
            method: "POST",
            body: JSON.stringify({
              uid: selected.uid,
              isAdmin: confirm.kind === "setAdmin",
            }),
          },
        );
        showToast(res.message || "已更新", "success");
      } else if (confirm.kind === "suspend") {
        await adminFetch("/api/admin/users/update", {
          method: "POST",
          body: JSON.stringify({
            uid: selected.uid,
            isSuspended: !selected.isSuspended,
          }),
        });
        showToast(
          selected.isSuspended ? "已解除封禁" : "已封禁用户",
          "success",
        );
      } else if (confirm.kind === "revokeSeller") {
        await adminFetch("/api/admin/users/update", {
          method: "POST",
          body: JSON.stringify({
            uid: selected.uid,
            isVerifiedSeller: false,
            sellerStatus: "none",
          }),
        });
        showToast("已撤销卖家权限", "success");
      }
      setConfirm(null);
      setSelected(null);
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "操作失败", "error");
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async () => {
    if (!selected) return;
    if (cannotAlterUser) {
      showToast(
        "无法更改：该用户为超级管理员，普通管理员不能修改其账号。",
        "error",
      );
      return;
    }
    setBusy(true);
    try {
      await adminFetch("/api/admin/users/update", {
        method: "POST",
        body: JSON.stringify({
          uid: selected.uid,
          nickname: edit.nickname,
          wechat: edit.wechat,
          phone: edit.phone,
        }),
      });
      showToast("资料已保存", "success");
      await load();
      setSelected((prev) =>
        prev
          ? {
              ...prev,
              nickname: edit.nickname,
              wechat: edit.wechat,
              phone: edit.phone,
            }
          : prev,
      );
    } catch (e) {
      showToast(e instanceof Error ? e.message : "保存失败", "error");
    } finally {
      setBusy(false);
    }
  };

  const decideSeller = async (decision: "approve" | "reject") => {
    if (!selected) return;
    setBusy(true);
    try {
      await adminFetch("/api/admin/users/decide", {
        method: "POST",
        body: JSON.stringify({ uid: selected.uid, decision }),
      });
      showToast(
        decision === "approve" ? "已通过卖家审核" : "已拒绝卖家申请",
        "success",
      );
      setSelected(null);
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "操作失败", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold tracking-tight">用户管理</h1>
        <p className="mt-1 text-[13px] text-[#5a6b73]">
          搜索、编辑资料、封禁，以及授予管理员权限
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6b73]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索昵称、邮箱、微信、手机或 UID"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-[rgba(31,41,51,0.08)] text-[14px] outline-none focus:border-[#2f9e6d]"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter(c.id)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold border transition-colors ${
              filter === c.id
                ? "bg-[#f3fbf7] text-[#2f9e6d] border-[#2f9e6d]/30"
                : "bg-white text-[#5a6b73] border-[rgba(31,41,51,0.08)] hover:border-[#2f9e6d]/20"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[rgba(31,41,51,0.08)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="sticky top-0 bg-[#fafbfc] border-b border-[rgba(31,41,51,0.06)]">
              <tr className="text-[#5a6b73]">
                <th className="px-4 py-3 font-semibold">用户</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">
                  邮箱
                </th>
                <th className="px-4 py-3 font-semibold">状态</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-12 text-center text-[#5a6b73]"
                  >
                    加载中…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-12 text-center text-[#5a6b73]"
                  >
                    没有匹配的用户
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.uid}
                    onClick={() => openUser(u)}
                    className="border-t border-[rgba(31,41,51,0.04)] hover:bg-[#f3fbf7]/60 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#eef2f0] shrink-0">
                          {u.avatarUrl ? (
                            <Image
                              src={u.avatarUrl}
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1f2933] truncate">
                            {u.nickname || "用户"}
                          </p>
                          <p className="text-[11px] text-[#5a6b73] truncate">
                            {u.uid.slice(0, 10)}…
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-[#5a6b73] truncate max-w-55">
                      {u.email || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.isSuperAdmin ? (
                          <StatusBadge label="超级管理员" tone="warning" />
                        ) : u.isAdmin ? (
                          <StatusBadge label="管理员" tone="info" />
                        ) : null}
                        {u.isVerifiedSeller && (
                          <StatusBadge label="卖家" tone="success" />
                        )}
                        {u.sellerStatus === "pending" && (
                          <StatusBadge label="待审核" tone="warning" />
                        )}
                        {u.isSuspended && (
                          <StatusBadge label="已封禁" tone="danger" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminDetailDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.nickname || "用户详情"}
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#eef2f0]">
                {selected.avatarUrl ? (
                  <Image
                    src={selected.avatarUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="font-bold truncate">{selected.nickname}</p>
                <p className="text-[12px] text-[#5a6b73] truncate">
                  {selected.email}
                </p>
              </div>
            </div>

            {selected.isSuperAdmin && (
              <div className="flex flex-wrap gap-1">
                <StatusBadge label="超级管理员" tone="warning" />
              </div>
            )}

            {cannotAlterUser && (
              <p className="text-[12px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 leading-relaxed">
                该用户为超级管理员（首任管理员）。普通管理员不能修改其资料、权限或状态。
              </p>
            )}

            <div className="space-y-3">
              <label className="block">
                <span className="text-[12px] font-bold text-[#5a6b73]">
                  昵称
                </span>
                <input
                  value={edit.nickname}
                  disabled={cannotAlterUser}
                  onChange={(e) =>
                    setEdit((s) => ({ ...s, nickname: e.target.value }))
                  }
                  className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[#f7f9fc] border border-transparent focus:border-[#2f9e6d] outline-none text-[14px] disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </label>
              <label className="block">
                <span className="text-[12px] font-bold text-[#5a6b73]">
                  微信
                </span>
                <input
                  value={edit.wechat}
                  disabled={cannotAlterUser}
                  onChange={(e) =>
                    setEdit((s) => ({ ...s, wechat: e.target.value }))
                  }
                  className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[#f7f9fc] border border-transparent focus:border-[#2f9e6d] outline-none text-[14px] disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </label>
              <label className="block">
                <span className="text-[12px] font-bold text-[#5a6b73]">
                  手机
                </span>
                <input
                  value={edit.phone}
                  disabled={cannotAlterUser}
                  onChange={(e) =>
                    setEdit((s) => ({ ...s, phone: e.target.value }))
                  }
                  className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[#f7f9fc] border border-transparent focus:border-[#2f9e6d] outline-none text-[14px] disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </label>
              <button
                type="button"
                disabled={busy || cannotAlterUser}
                onClick={() => void saveProfile()}
                className="w-full py-2.5 rounded-xl bg-[#2f9e6d] text-white text-[13px] font-bold hover:bg-[#267a56] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                保存资料
              </button>
            </div>

            {PRE_APPROVAL_ENABLED &&
              selected.sellerStatus === "pending" &&
              !cannotAlterUser && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void decideSeller("approve")}
                    className="flex-1 py-2.5 rounded-xl bg-[#2f9e6d] text-white text-[13px] font-bold"
                  >
                    通过卖家
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void decideSeller("reject")}
                    className="flex-1 py-2.5 rounded-xl border border-rose-200 text-rose-600 text-[13px] font-bold"
                  >
                    拒绝
                  </button>
                </div>
              )}

            <div className="space-y-2 pt-2 border-t border-[rgba(31,41,51,0.06)]">
              <button
                type="button"
                onClick={() => {
                  if (cannotAlterUser) {
                    showToast(
                      "无法更改：该用户为超级管理员，普通管理员不能修改其权限。",
                      "error",
                    );
                    return;
                  }
                  if (cannotRevokeAdmin && selected.isAdmin) {
                    showToast(
                      isLastAdmin
                        ? "无法更改：这是最后一位管理员。请先将管理员权限授予其他用户。"
                        : selected.isSuperAdmin
                          ? "无法更改：超级管理员权限不能通过此处撤销。"
                          : "不能撤销自己的管理员权限",
                      "error",
                    );
                    return;
                  }
                  setConfirm({
                    kind: selected.isAdmin ? "unsetAdmin" : "setAdmin",
                  });
                }}
                disabled={
                  cannotAlterUser ||
                  (selected.isAdmin ? cannotRevokeAdmin : false)
                }
                className="w-full py-2.5 rounded-xl border border-[rgba(31,41,51,0.1)] text-[13px] font-bold hover:bg-[#f7f9fc] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                {selected.isAdmin ? "撤销管理员" : "设为管理员"}
              </button>
              {cannotAlterUser ? (
                <p className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 leading-relaxed">
                  超级管理员受保护：普通管理员无法更改其任何状态。
                </p>
              ) : isLastAdmin ? (
                <p className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 leading-relaxed">
                  这是系统中最后一位管理员，无法撤销或更改该管理员状态。请先授予其他用户管理员权限。
                </p>
              ) : null}
              {!cannotAlterUser &&
                !isLastAdmin &&
                me?.uid === selected.uid &&
                selected.isAdmin && (
                  <p className="text-[12px] text-[#5a6b73] px-1">
                    不能撤销自己的管理员权限。
                  </p>
                )}
              {selected.isVerifiedSeller && !cannotAlterUser && (
                <button
                  type="button"
                  onClick={() => setConfirm({ kind: "revokeSeller" })}
                  className="w-full py-2.5 rounded-xl border border-amber-200 text-amber-700 text-[13px] font-bold hover:bg-amber-50"
                >
                  撤销卖家权限
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (cannotAlterUser) {
                    showToast(
                      "无法更改：该用户为超级管理员，普通管理员不能修改其状态。",
                      "error",
                    );
                    return;
                  }
                  setConfirm({ kind: "suspend" });
                }}
                disabled={cannotAlterUser}
                className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 text-[13px] font-bold hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                {selected.isSuspended ? "解除封禁" : "封禁用户"}
              </button>
            </div>
          </div>
        )}
      </AdminDetailDrawer>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={
          confirm?.kind === "setAdmin"
            ? "设为管理员？"
            : confirm?.kind === "unsetAdmin"
              ? "撤销管理员？"
              : confirm?.kind === "revokeSeller"
                ? "撤销卖家权限？"
                : selected?.isSuspended
                  ? "解除封禁？"
                  : "封禁用户？"
        }
        description={
          confirm?.kind === "setAdmin"
            ? "将更新 Firebase Auth 自定义声明。对方需重新登录后生效。"
            : confirm?.kind === "unsetAdmin"
              ? isLastAdmin
                ? "无法更改：这是最后一位管理员。请先将管理员权限授予其他用户。"
                : "将更新 Firebase Auth 自定义声明。对方需重新登录后生效。"
              : undefined
        }
        tone={
          confirm?.kind === "setAdmin" ||
          (confirm?.kind === "suspend" && selected?.isSuspended)
            ? "primary"
            : "danger"
        }
        confirmLabel="确认"
        onConfirm={() => void runConfirm()}
        busy={busy}
      />
    </div>
  );
}
