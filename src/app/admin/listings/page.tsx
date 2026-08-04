"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { adminFetch } from "@/lib/admin/client";
import { PRE_APPROVAL_ENABLED } from "@/lib/moderation/config";
import { useApp } from "@/components/app/AppContext";
import StatusBadge from "@/components/admin/StatusBadge";
import AdminDetailDrawer from "@/components/admin/AdminDetailDrawer";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

type AdminListing = {
  id: string;
  type: "item" | "sublet";
  title: string;
  price: number;
  status: string;
  sellerId: string;
  sellerNickname: string;
  sellerAvatar: string;
  images: string[];
  moderationStatus: string;
  isHidden: boolean;
  hiddenReason: string;
  location: string;
  description: string;
};

export default function AdminListingsPage() {
  const { showToast } = useApp();
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "item" | "sublet">(
    "all",
  );
  const [viewFilter, setViewFilter] = useState<"all" | "pending" | "hidden">(
    "all",
  );
  const [selected, setSelected] = useState<AdminListing | null>(null);
  const [busy, setBusy] = useState(false);
  const [hideConfirm, setHideConfirm] = useState(false);
  const [hideReason, setHideReason] = useState("");
  const [edit, setEdit] = useState({
    title: "",
    price: "",
    description: "",
    status: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("type", typeFilter);
      if (search.trim()) params.set("search", search.trim());
      if (viewFilter === "pending") params.set("moderationStatus", "pending");
      if (viewFilter === "hidden") params.set("hidden", "true");
      const data = await adminFetch<{ listings: AdminListing[] }>(
        `/api/admin/listings?${params.toString()}`,
      );
      setListings(data.listings);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setLoading(false);
    }
  }, [search, showToast, typeFilter, viewFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      void load();
    }, 200);
    return () => clearTimeout(t);
  }, [load]);

  const openListing = (l: AdminListing) => {
    setSelected(l);
    setEdit({
      title: l.title,
      price: String(l.price),
      description: l.description || "",
      status: l.status,
    });
    setHideReason(l.hiddenReason || "");
  };

  const viewChips = useMemo(() => {
    const chips: { id: typeof viewFilter; label: string }[] = [
      { id: "all", label: "全部状态" },
      { id: "hidden", label: "已隐藏" },
    ];
    if (PRE_APPROVAL_ENABLED) {
      chips.splice(1, 0, { id: "pending", label: "待审核" });
    }
    return chips;
  }, []);

  const saveListing = async () => {
    if (!selected) return;
    const price = Number(edit.price);
    if (!Number.isFinite(price) || price < 0) {
      showToast("请输入有效价格", "info");
      return;
    }
    setBusy(true);
    try {
      await adminFetch("/api/admin/listings/update", {
        method: "POST",
        body: JSON.stringify({
          collection: selected.type === "item" ? "items" : "sublets",
          id: selected.id,
          title: edit.title,
          price,
          description: edit.description,
          status: edit.status,
        }),
      });
      showToast("已保存", "success");
      setSelected(null);
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "保存失败", "error");
    } finally {
      setBusy(false);
    }
  };

  const toggleHide = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await adminFetch("/api/admin/listings/update", {
        method: "POST",
        body: JSON.stringify({
          collection: selected.type === "item" ? "items" : "sublets",
          id: selected.id,
          isHidden: !selected.isHidden,
          hiddenReason: hideReason,
        }),
      });
      showToast(selected.isHidden ? "已重新展示" : "已隐藏商品", "success");
      setHideConfirm(false);
      setSelected(null);
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "操作失败", "error");
    } finally {
      setBusy(false);
    }
  };

  const decide = async (decision: "approve" | "reject") => {
    if (!selected) return;
    setBusy(true);
    try {
      await adminFetch("/api/admin/listings/decide", {
        method: "POST",
        body: JSON.stringify({
          collection: selected.type === "item" ? "items" : "sublets",
          id: selected.id,
          decision,
        }),
      });
      showToast(decision === "approve" ? "已通过审核" : "已拒绝", "success");
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
        <h1 className="text-[22px] font-bold tracking-tight">商品管理</h1>
        <p className="mt-1 text-[13px] text-[#5a6b73]">
          统一管理闲置与转租：编辑、隐藏，或审核待发布内容
        </p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6b73]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索标题、地点、卖家 UID…"
          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-[rgba(31,41,51,0.08)] text-[14px] outline-none focus:border-[#2f9e6d]"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        {(
          [
            { id: "all" as const, label: "全部" },
            { id: "item" as const, label: "闲置" },
            { id: "sublet" as const, label: "转租" },
          ] as const
        ).map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setTypeFilter(c.id)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold border transition-colors ${
              typeFilter === c.id
                ? "bg-[#f3fbf7] text-[#2f9e6d] border-[#2f9e6d]/30"
                : "bg-white text-[#5a6b73] border-[rgba(31,41,51,0.08)]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {viewChips.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setViewFilter(c.id)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold border transition-colors ${
              viewFilter === c.id
                ? "bg-[#f3fbf7] text-[#2f9e6d] border-[#2f9e6d]/30"
                : "bg-white text-[#5a6b73] border-[rgba(31,41,51,0.08)]"
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
                <th className="px-4 py-3 font-semibold">商品</th>
                <th className="px-4 py-3 font-semibold">类型</th>
                <th className="px-4 py-3 font-semibold">价格</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">
                  卖家
                </th>
                <th className="px-4 py-3 font-semibold">状态</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-[#5a6b73]"
                  >
                    加载中…
                  </td>
                </tr>
              ) : listings.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-[#5a6b73]"
                  >
                    没有匹配的商品
                  </td>
                </tr>
              ) : (
                listings.map((l) => (
                  <tr
                    key={`${l.type}-${l.id}`}
                    onClick={() => openListing(l)}
                    className="border-t border-[rgba(31,41,51,0.04)] hover:bg-[#f3fbf7]/60 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#eef2f0] shrink-0">
                          {l.images[0] ? (
                            <Image
                              src={l.images[0]}
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{l.title}</p>
                          <p className="text-[11px] text-[#5a6b73] truncate">
                            {l.location || l.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={l.type === "item" ? "闲置" : "转租"}
                        tone={l.type === "item" ? "info" : "success"}
                      />
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#2f9e6d]">
                      ${l.price}
                      {l.type === "sublet" ? "/月" : ""}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-[#5a6b73] truncate max-w-35">
                      {l.sellerNickname || l.sellerId.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <StatusBadge label={l.status || "—"} tone="neutral" />
                        {l.isHidden && (
                          <StatusBadge label="已隐藏" tone="danger" />
                        )}
                        {l.moderationStatus === "pending" && (
                          <StatusBadge label="待审核" tone="warning" />
                        )}
                        {l.moderationStatus === "rejected" && (
                          <StatusBadge label="已拒绝" tone="danger" />
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
        title={selected?.title || "商品详情"}
      >
        {selected && (
          <div className="space-y-5">
            {selected.images[0] && (
              <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-[#eef2f0]">
                <Image
                  src={selected.images[0]}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            <div className="flex flex-wrap gap-1">
              <StatusBadge
                label={selected.type === "item" ? "闲置" : "转租"}
                tone="info"
              />
              <StatusBadge label={selected.status} />
              {selected.isHidden && (
                <StatusBadge label="已隐藏" tone="danger" />
              )}
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="text-[12px] font-bold text-[#5a6b73]">
                  标题
                </span>
                <input
                  value={edit.title}
                  onChange={(e) =>
                    setEdit((s) => ({ ...s, title: e.target.value }))
                  }
                  className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[#f7f9fc] border border-transparent focus:border-[#2f9e6d] outline-none text-[14px]"
                />
              </label>
              <label className="block">
                <span className="text-[12px] font-bold text-[#5a6b73]">
                  价格
                </span>
                <input
                  value={edit.price}
                  onChange={(e) =>
                    setEdit((s) => ({ ...s, price: e.target.value }))
                  }
                  className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[#f7f9fc] border border-transparent focus:border-[#2f9e6d] outline-none text-[14px]"
                />
              </label>
              <label className="block">
                <span className="text-[12px] font-bold text-[#5a6b73]">
                  状态
                </span>
                <input
                  value={edit.status}
                  onChange={(e) =>
                    setEdit((s) => ({ ...s, status: e.target.value }))
                  }
                  className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[#f7f9fc] border border-transparent focus:border-[#2f9e6d] outline-none text-[14px]"
                />
              </label>
              <label className="block">
                <span className="text-[12px] font-bold text-[#5a6b73]">
                  描述
                </span>
                <textarea
                  value={edit.description}
                  onChange={(e) =>
                    setEdit((s) => ({ ...s, description: e.target.value }))
                  }
                  rows={4}
                  className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[#f7f9fc] border border-transparent focus:border-[#2f9e6d] outline-none text-[14px] resize-none"
                />
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={() => void saveListing()}
                className="w-full py-2.5 rounded-xl bg-[#2f9e6d] text-white text-[13px] font-bold hover:bg-[#267a56] disabled:opacity-60"
              >
                保存修改
              </button>
            </div>

            {PRE_APPROVAL_ENABLED &&
              selected.moderationStatus === "pending" && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void decide("approve")}
                    className="flex-1 py-2.5 rounded-xl bg-[#2f9e6d] text-white text-[13px] font-bold"
                  >
                    通过审核
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void decide("reject")}
                    className="flex-1 py-2.5 rounded-xl border border-rose-200 text-rose-600 text-[13px] font-bold"
                  >
                    拒绝
                  </button>
                </div>
              )}

            <button
              type="button"
              onClick={() => setHideConfirm(true)}
              className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 text-[13px] font-bold hover:bg-rose-50"
            >
              {selected.isHidden ? "取消隐藏 / 重新展示" : "隐藏商品"}
            </button>

            <p className="text-[11px] text-[#5a6b73]">
              卖家：{selected.sellerNickname || selected.sellerId}
            </p>
          </div>
        )}
      </AdminDetailDrawer>

      <ConfirmDialog
        open={hideConfirm}
        onClose={() => setHideConfirm(false)}
        title={selected?.isHidden ? "重新展示此商品？" : "隐藏此商品？"}
        description={
          selected?.isHidden
            ? "商品将重新出现在浏览列表中（仍受审核状态影响）。"
            : "隐藏后前台用户将看不到此商品。"
        }
        tone={selected?.isHidden ? "primary" : "danger"}
        confirmLabel="确认"
        onConfirm={() => void toggleHide()}
        busy={busy}
      >
        {!selected?.isHidden && (
          <input
            value={hideReason}
            onChange={(e) => setHideReason(e.target.value)}
            placeholder="隐藏原因（可选）"
            className="w-full px-3 py-2.5 rounded-xl bg-[#f7f9fc] text-[13px] outline-none border border-transparent focus:border-[#2f9e6d]"
          />
        )}
      </ConfirmDialog>
    </div>
  );
}
