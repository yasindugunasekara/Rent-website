"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, AlertCircle, ShoppingBag, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import * as api from "@/lib/api-client";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "@/lib/i18n/LocaleContext";

const OAUTH_ERROR_KEYS = {
  google_not_configured: "auth.errorGoogleNotConfigured",
  invalid_oauth_state: "auth.errorInvalidOauthState",
  google_email_unverified: "auth.errorGoogleEmailUnverified",
  email_in_use: "auth.errorEmailInUse",
  google_auth_failed: "auth.errorGoogleAuthFailed",
};

// useSearchParams() opts the page out of static rendering unless wrapped in
// its own Suspense boundary — this default export is just that boundary;
// all the actual page logic lives in LoginForm below.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (searchParams.get("registered")) setJustRegistered(true);
    const oauthError = searchParams.get("error");
    if (oauthError) setError(t(OAUTH_ERROR_KEYS[oauthError] ?? "auth.errorSignInFailed"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setJustRegistered(false);
    setLoading(true);

    try {
      await api.login({ email, password });
      await refresh();
      const next = searchParams.get("next") || "/dashboard";
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof api.ApiClientError ? err.message : t("auth.unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#F9FAFB] overflow-hidden">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#D4A353]/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[400px] px-4 animate-fadeIn">
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-blue-600 p-2.5 rounded-xl mb-3 shadow-lg shadow-blue-900/20">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter">
              Rent<span className="text-blue-600">Anything</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">{t("auth.publisherLogin")}</p>
          </div>

          {justRegistered && (
            <div className="mb-4 flex items-center gap-2 bg-blue-50 border border-blue-100 p-3 rounded-xl text-blue-700 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              {t("auth.accountReady")}
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-100 p-3 rounded-xl text-red-600 text-xs font-bold">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t("auth.email")}</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600" />
                <input
                  type="email"
                  required
                  placeholder="name@mail.com"
                  className="w-full bg-gray-50 border border-gray-100 focus:border-blue-600 focus:bg-white rounded-xl py-3 pl-11 pr-4 outline-none transition-all font-bold text-sm text-gray-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("auth.password")}</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-100 focus:border-blue-600 focus:bg-white rounded-xl py-3 pl-11 pr-11 outline-none transition-all font-bold text-sm text-gray-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white text-sm font-black py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/10 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("auth.signIn")}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-100"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("auth.or")}</span>
            <div className="h-px flex-1 bg-gray-100"></div>
          </div>

          <a
            href="/api/auth/google/start"
            className="w-full bg-white border border-gray-100 hover:bg-gray-50 text-gray-900 text-sm font-black py-3.5 rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center gap-3 active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.01.67-2.31 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {t("auth.continueWithGoogle")}
          </a>

          <div className="mt-6 text-center">
            <p className="text-xs font-bold text-gray-400">
              {t("auth.newHere")}{" "}
              <Link href="/register" className="text-blue-600 hover:underline underline-offset-4 font-black">
                {t("auth.joinAsPublisher")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
