"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useApp } from "@/components/app/AppContext";

function getAuthSubtitle(pathname: string): string {
  if (pathname.startsWith("/messages")) {
    return "登录后查看并处理您的消息";
  }
  if (pathname.startsWith("/profile/settings")) {
    return "登录后管理您的通知设置";
  }
  if (pathname.startsWith("/profile")) {
    return "登录后继续使用枫转";
  }
  return "闲置转租一眼看清";
}

export default function AuthModal() {
  const pathname = usePathname();
  const subtitle = getAuthSubtitle(pathname);
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuthStore();
  const { showToast } = useApp();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("请填写邮箱和密码", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
        showToast("登录成功", "success");
      } else {
        if (!nickname.trim()) {
          showToast("请输入昵称", "error");
          setIsSubmitting(false);
          return;
        }
        await registerWithEmail(email, password, nickname.trim());
        showToast("注册成功", "success");
      }
    } catch (error: unknown) {
      const code = (error as { code?: string }).code;
      let msg = "发生错误，请重试";
      if (code === "auth/invalid-email") msg = "邮箱格式不正确";
      else if (code === "auth/user-not-found") msg = "该账号不存在，请先注册";
      else if (code === "auth/wrong-password") msg = "密码错误";
      else if (code === "auth/invalid-credential")
        msg = "邮箱或密码错误，若尚未注册请先注册";
      else if (code === "auth/email-already-in-use")
        msg = "该邮箱已被注册，请直接登录";
      else if (code === "auth/weak-password")
        msg = "密码太弱，请至少使用6位字符";

      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await loginWithGoogle();
      showToast("登录成功", "success");
    } catch (error: unknown) {
      if (
        (error as { code?: string }).code === "auth/popup-closed-by-user" ||
        (error as { code?: string }).code === "auth/cancelled-popup-request"
      ) {
        return;
      }
      showToast("Google 登录失败，请重试", "error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-[#f3fbf7] px-4 py-8">
      <div className="w-full max-w-[400px] bg-white rounded-[32px] p-8 shadow-[0_24px_48px_rgba(31,41,51,0.08)] border border-[rgba(31,41,51,0.04)] relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#2f9e6d] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-[#f3fbf7] text-[#2f9e6d] rounded-2xl flex items-center justify-center shadow-inner mb-6 text-3xl">
            <img
              src="/logo/logo.svg"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-[#1f2933] mb-2">
            欢迎来到 MapleZhuan
          </h1>
          <p className="text-sm text-[#5a6b73] text-center mb-8">{subtitle}</p>

          {/* Mode Toggle */}
          <div className="flex w-full bg-gray-50 p-1 rounded-xl mb-6 border border-[rgba(31,41,51,0.04)] relative">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-transform duration-300 ease-out ${mode === "register" ? "translate-x-full" : "translate-x-0"}`}
            />
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 text-sm font-bold z-10 transition-colors ${mode === "login" ? "text-[#2f9e6d]" : "text-[#5a6b73] hover:text-[#1f2933]"}`}
            >
              登录
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 text-sm font-bold z-10 transition-colors ${mode === "register" ? "text-[#2f9e6d]" : "text-[#5a6b73] hover:text-[#1f2933]"}`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="w-full space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#5a6b73] mb-1.5 ml-1">
                邮箱
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:border-[#2f9e6d] focus:bg-white rounded-xl text-sm outline-none transition-all placeholder:text-gray-400 font-medium"
                  required
                />
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-[11px] font-bold text-[#5a6b73] mb-1.5 ml-1">
                  昵称
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="请输入昵称"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:border-[#2f9e6d] focus:bg-white rounded-xl text-sm outline-none transition-all placeholder:text-gray-400 font-medium"
                    required={mode === "register"}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#5a6b73] mb-1.5 ml-1">
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    mode === "register" ? "设置不少于 6 位的密码" : "请输入密码"
                  }
                  className="w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-transparent focus:border-[#2f9e6d] focus:bg-white rounded-xl text-sm outline-none transition-all placeholder:text-gray-400 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 mt-2 rounded-xl bg-[#2f9e6d] hover:bg-[#267a56] disabled:opacity-50 text-white font-bold text-[15px] transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting
                ? "请稍候..."
                : mode === "login"
                  ? "登录"
                  : "注册账号"}
            </button>
          </form>

          <div className="flex items-center w-full my-6 opacity-60">
            <div className="flex-1 h-[1px] bg-gray-200"></div>
            <span className="px-4 text-[11px] font-medium text-gray-500">
              或通过以下方式
            </span>
            <div className="flex-1 h-[1px] bg-gray-200"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full py-3.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-[#1f2933] font-bold text-[15px] transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            继续使用 Google
          </button>
        </div>
      </div>
    </div>
  );
}
