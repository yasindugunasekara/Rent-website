"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, AlertCircle, ShoppingBag, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("registered")) {
      setJustRegistered(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setJustRegistered(false);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result.error) {
        setError("Invalid credentials. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#F9FAFB] overflow-hidden">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#D4A353]/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[400px] px-4 animate-fadeIn">
        
        {/* COMPACT CARD */}
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-gray-100">
          
          {/* HEADER */}
          <div className="flex flex-col items-center mb-6">
            <div className="bg-blue-600 p-2.5 rounded-xl mb-3 shadow-lg shadow-blue-900/20">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter">
              Rent<span className="text-blue-600">Anything</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Publisher Login</p>
          </div>

          {justRegistered && (
            <div className="mb-4 flex items-center gap-2 bg-blue-50 border border-blue-100 p-3 rounded-xl text-blue-700 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Account ready. Please sign in.
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
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
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
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                <Link href="#" className="text-[10px] font-bold text-blue-600 hover:underline">Forgot?</Link>
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs font-bold text-gray-400">
              New here?{" "}
              <Link href="/register" className="text-blue-600 hover:underline underline-offset-4 font-black">
                Join as Publisher
              </Link>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
