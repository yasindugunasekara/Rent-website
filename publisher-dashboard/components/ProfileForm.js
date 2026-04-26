"use client";

import { useState } from "react";
import Image from "next/image";
import { User, Mail, Phone, MapPin, Lock, Camera, Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { sanitizePhone, sanitizeText } from "@/lib/sanitize";

export default function ProfileForm({ initialValues, onSubmit, isSubmitting }) {
  const [form, setForm] = useState({
    name: initialValues?.name || "",
    email: initialValues?.email || "",
    phone: initialValues?.phone || "",
    location: initialValues?.location || "",
    bio: initialValues?.bio || "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profilePic, setProfilePic] = useState(initialValues?.profilePic || "");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setProfilePic(objectUrl);
  };

  const validate = () => {
    const nextErrors = {};
    if (!sanitizeText(form.name)) nextErrors.name = "Name is required.";
    if (!sanitizeText(form.email) || !form.email.includes("@")) nextErrors.email = "Enter a valid email.";
    if (!sanitizePhone(form.phone)) nextErrors.phone = "Valid phone is required.";
    if (!sanitizeText(form.location)) nextErrors.location = "Location is required.";

    if (passwords.newPassword) {
      if (!passwords.currentPassword) nextErrors.currentPassword = "Required to change password.";
      if (passwords.newPassword.length < 6) nextErrors.newPassword = "Must be at least 6 characters.";
      if (passwords.newPassword !== passwords.confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    
    const submissionData = { ...form, profilePic, ...(passwords.newPassword && passwords) };
    
    await onSubmit(submissionData);
    
    setSuccess("Profile updated successfully!");
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => setSuccess(""), 4000);
  };

  const ErrorMsg = ({ msg }) => {
    if (!msg) return null;
    return (
      <div className="flex items-center gap-1 mt-1 text-red-500 text-xs font-medium animate-fadeIn">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>{msg}</span>
      </div>
    );
  };

  return (
    // FIX: pb-28 එකක් දුන්නා ෆෝන් එකේදී බොත්තමට යටින් Form එක හැංගෙන්නේ නැති වෙන්න. Desktop (md) වලදී pb-0 කරනවා.
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl space-y-8 animate-fadeIn pb-28 md:pb-10">
      
      {success && (
        <div className="flex items-center gap-3 rounded-2xl bg-success/10 px-5 py-4 border border-success/20 animate-fadeIn">
          <CheckCircle2 className="w-6 h-6 text-success" />
          <p className="text-sm font-bold text-successHover">{success}</p>
        </div>
      )}

      <div className="rounded-[2rem] bg-surface p-6 sm:p-10 shadow-sm border border-gray-100">
        
        {/* --- SECTION 1: PROFILE PICTURE & BIO --- */}
        <section className="flex flex-col sm:flex-row gap-8 items-start pb-8 border-b border-gray-100">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-32 h-32 rounded-full border-4 border-background shadow-md overflow-hidden group bg-gray-50 flex-shrink-0">
              {profilePic ? (
                <Image src={profilePic} alt="Profile" fill className="object-cover" />
              ) : (
                <User className="w-16 h-16 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
              <label htmlFor="profilePic" className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white mb-1" />
                <span className="text-xs text-white font-medium">Change</span>
              </label>
              <input id="profilePic" type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={isSubmitting} />
            </div>
          </div>

          <div className="flex-grow w-full space-y-2">
            <label htmlFor="bio" className="text-sm font-bold text-textMain">
              About Me (Bio) <span className="text-textMuted font-normal ml-1">- Builds Trust</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              placeholder="e.g. Hi, I'm John! I've been renting high-quality camera gear for 5 years..."
              value={form.bio}
              onChange={handleFormChange}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-200 bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>
        </section>

        {/* --- SECTION 2: PERSONAL DETAILS --- */}
        <section className="py-8 border-b border-gray-100">
          <h3 className="text-lg font-bold text-textMain mb-5">Personal Details</h3>
          <div className="grid gap-6 md:grid-cols-2">
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-textMain" htmlFor="name">Full Name</label>
              <div className="relative">
                <User className="w-5 h-5 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="name" name="name" value={form.name} onChange={handleFormChange} disabled={isSubmitting}
                  className={`w-full rounded-xl border bg-background pl-11 pr-4 py-3 outline-none transition-all ${errors.name ? 'border-red-500' : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
                />
              </div>
              <ErrorMsg msg={errors.name} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-textMain" htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="email" name="email" value={form.email} onChange={handleFormChange} disabled={isSubmitting}
                  className={`w-full rounded-xl border bg-background pl-11 pr-4 py-3 outline-none transition-all ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
                />
              </div>
              <ErrorMsg msg={errors.email} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-textMain" htmlFor="phone">Phone Number</label>
              <div className="relative">
                <Phone className="w-5 h-5 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="phone" name="phone" value={form.phone} onChange={handleFormChange} disabled={isSubmitting}
                  className={`w-full rounded-xl border bg-background pl-11 pr-4 py-3 outline-none transition-all ${errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
                />
              </div>
              <ErrorMsg msg={errors.phone} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-textMain" htmlFor="location">Main Location</label>
              <div className="relative">
                <MapPin className="w-5 h-5 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="location" name="location" value={form.location} onChange={handleFormChange} disabled={isSubmitting}
                  className={`w-full rounded-xl border bg-background pl-11 pr-4 py-3 outline-none transition-all ${errors.location ? 'border-red-500' : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
                />
              </div>
              <ErrorMsg msg={errors.location} />
            </div>

          </div>
        </section>

        {/* --- SECTION 3: SECURITY (PASSWORD) --- */}
        <section className="pt-8">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-textMain">Security</h3>
            <p className="text-sm text-textMuted">Leave empty if you don't want to change your password.</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-textMain" htmlFor="currentPassword">Current Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="currentPassword" name="currentPassword" type="password" placeholder="••••••••"
                  value={passwords.currentPassword} onChange={handlePasswordChange} disabled={isSubmitting}
                  className={`w-full md:w-1/2 rounded-xl border bg-background pl-11 pr-4 py-3 outline-none transition-all ${errors.currentPassword ? 'border-red-500' : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
                />
              </div>
              <ErrorMsg msg={errors.currentPassword} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-textMain" htmlFor="newPassword">New Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="newPassword" name="newPassword" type="password" placeholder="••••••••"
                  value={passwords.newPassword} onChange={handlePasswordChange} disabled={isSubmitting}
                  className={`w-full rounded-xl border bg-background pl-11 pr-4 py-3 outline-none transition-all ${errors.newPassword ? 'border-red-500' : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
                />
              </div>
              <ErrorMsg msg={errors.newPassword} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-textMain" htmlFor="confirmPassword">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••"
                  value={passwords.confirmPassword} onChange={handlePasswordChange} disabled={isSubmitting}
                  className={`w-full rounded-xl border bg-background pl-11 pr-4 py-3 outline-none transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
                />
              </div>
              <ErrorMsg msg={errors.confirmPassword} />
            </div>

          </div>
        </section>

      </div>

      {/* 🔥 SAVE ACTIONS: STICKY ON MOBILE, NORMAL ON DESKTOP 🔥 */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 p-4 z-50 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] md:static md:bg-transparent md:border-0 md:p-0 md:shadow-none md:flex md:justify-end md:pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-10 py-3.5 text-lg font-bold text-white shadow-md transition-all hover:bg-primaryHover hover:shadow-lg hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-primary/60 disabled:hover:translate-y-0"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>

    </form>
  );
}