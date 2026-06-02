"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, AlertCircle, ShoppingBag, User, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        router.push("/login?registered=true");
      } else {
        const data = await response.json();
        setError(data.message || "Registration failed.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#F9FAFB] overflow-hidden">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#D4A353]/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[500px] px-4 animate-fadeIn">
        
        {/* COMPACT CARD */}
        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-gray-100">
          
          {/* HEADER */}
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-900/10">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tighter leading-none">
                Rent<span className="text-blue-600">Anything</span>
              </h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Publisher Account</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-100 p-3 rounded-xl text-red-600 text-xs font-bold">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* NAME GRID */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                <input
                  name="firstName"
                  required
                  placeholder="John"
                  className="w-full bg-gray-50 border border-gray-100 focus:border-blue-600 focus:bg-white rounded-xl py-3 px-4 outline-none transition-all font-bold text-sm text-gray-900"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                <input
                  name="lastName"
                  required
                  placeholder="Doe"
                  className="w-full bg-gray-50 border border-gray-100 focus:border-blue-600 focus:bg-white rounded-xl py-3 px-4 outline-none transition-all font-bold text-sm text-gray-900"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@mail.com"
                  className="w-full bg-gray-50 border border-gray-100 focus:border-blue-600 focus:bg-white rounded-xl py-3 pl-11 pr-4 outline-none transition-all font-bold text-sm text-gray-900"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* PASSWORD GRID */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600" />
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-100 focus:border-blue-600 focus:bg-white rounded-xl py-3 pl-11 pr-4 outline-none transition-all font-bold text-sm text-gray-900"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm</label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-100 focus:border-blue-600 focus:bg-white rounded-xl py-3 px-4 outline-none transition-all font-bold text-sm text-gray-900"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white text-sm font-black py-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/10 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Publisher Account"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-100"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">OR</span>
            <div className="h-px flex-1 bg-gray-100"></div>
          </div>

          <button
            onClick={() => {
              setIsGoogleLoading(true);
              signIn("google", { callbackUrl: "/dashboard" });
            }}
            disabled={isGoogleLoading || loading}
            className="w-full bg-white border border-gray-100 hover:bg-gray-50 disabled:opacity-70 text-gray-900 text-sm font-black py-3.5 rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center gap-3 active:scale-95"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.01.67-2.31 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {isGoogleLoading ? "Connecting..." : "Continue with Google"}
          </button>

          <div className="mt-8 text-center border-t border-gray-50 pt-6">
            <p className="text-xs font-bold text-gray-400">
              Already a publisher?{" "}
              <Link href="/login" className="text-blue-600 hover:underline underline-offset-4 font-black">
                Sign In
              </Link>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
