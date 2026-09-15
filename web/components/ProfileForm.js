"use client";

import { useState } from "react";
import Image from "next/image";
import { User, Mail, Phone, MapPin, Lock, Camera, Save, CheckCircle2, AlertCircle, Loader2, Globe } from "lucide-react";
import { sanitizePhone, sanitizeText } from "@/lib/sanitize";
import { uploadImages, ApiClientError } from "@/lib/api-client";
import { useCurrency } from "@/lib/CurrencyContext";
import CurrencySelect from "@/components/CurrencySelect";
import { useTranslation } from "@/lib/i18n/LocaleContext";

// Hoisted out of ProfileForm so it's a stable component identity across
// renders (a component defined inside a render function gets a new type on
// every render, forcing React to remount it instead of updating props).
function ErrorMsg({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-1 mt-1 text-red-500 text-xs font-medium animate-fadeIn">
      <AlertCircle className="w-3.5 h-3.5" />
      <span>{msg}</span>
    </div>
  );
}

export default function ProfileForm({ initialValues, onSubmit, isSubmitting }) {
  const { availableCurrencies } = useCurrency();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: initialValues?.name || "",
    email: initialValues?.email || "",
    phone: initialValues?.phone || "",
    location: initialValues?.location || "",
    bio: initialValues?.bio || "",
    preferredCurrency: initialValues?.preferredCurrency || "USD",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profilePic, setProfilePic] = useState(initialValues?.profilePic || "");
  const [uploadingPic, setUploadingPic] = useState(false);
  const [success, setSuccess] = useState("");
  const [formError, setFormError] = useState("");
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

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingPic(true);
    setErrors((prev) => ({ ...prev, profilePic: null }));
    try {
      const { files } = await uploadImages([file]);
      const uploaded = files[0];
      if (uploaded) setProfilePic(uploaded.url);
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : t("profileForm.uploadFailed");
      setErrors((prev) => ({ ...prev, profilePic: message }));
    } finally {
      setUploadingPic(false);
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!sanitizeText(form.name)) nextErrors.name = t("profileForm.nameRequired");
    if (!sanitizeText(form.email) || !form.email.includes("@")) nextErrors.email = t("profileForm.emailInvalid");
    if (!sanitizePhone(form.phone)) nextErrors.phone = t("profileForm.phoneInvalid");
    if (!sanitizeText(form.location)) nextErrors.location = t("profileForm.locationRequired");

    if (passwords.newPassword) {
      if (!passwords.currentPassword) nextErrors.currentPassword = t("profileForm.currentPasswordRequired");
      if (passwords.newPassword.length < 12) nextErrors.newPassword = t("profileForm.newPasswordTooShort");
      if (passwords.newPassword !== passwords.confirmPassword) nextErrors.confirmPassword = t("profileForm.confirmPasswordMismatch");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;

    const submissionData = { ...form, profilePic, ...(passwords.newPassword && passwords) };

    try {
      await onSubmit(submissionData);
      setSuccess(t("profileForm.profileUpdated"));
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : t("profileForm.saveFailed"));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl space-y-8 animate-fadeIn pb-28 md:pb-10">
      {success && (
        <div className="flex items-center gap-3 rounded-2xl bg-success/10 px-5 py-4 border border-success/20 animate-fadeIn">
          <CheckCircle2 className="w-6 h-6 text-success" />
          <p className="text-sm font-bold text-successHover">{success}</p>
        </div>
      )}

      {formError && (
        <div className="flex items-center gap-3 rounded-2xl bg-red-50 px-5 py-4 border border-red-100 animate-fadeIn">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <p className="text-sm font-bold text-red-600">{formError}</p>
        </div>
      )}

      <div className="rounded-[2rem] bg-surface p-6 sm:p-10 shadow-sm border border-gray-100">
        {/* --- SECTION 1: PROFILE PICTURE & BIO --- */}
        <section className="flex flex-col sm:flex-row gap-8 items-start pb-8 border-b border-gray-100">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-32 h-32 rounded-full border-4 border-background shadow-md overflow-hidden group bg-gray-50 flex-shrink-0">
              {profilePic ? (
                <Image src={profilePic} alt="Profile" fill className="object-cover" unoptimized />
              ) : (
                <User className="w-16 h-16 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
              <label
                htmlFor="profilePic"
                className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploadingPic ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-white mb-1" />
                    <span className="text-xs text-white font-medium">{t("profileForm.change")}</span>
                  </>
                )}
              </label>
              <input
                id="profilePic"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleImageChange}
                className="hidden"
                disabled={isSubmitting || uploadingPic}
              />
            </div>
            <ErrorMsg msg={errors.profilePic} />
          </div>

          <div className="flex-grow w-full space-y-2">
            <label htmlFor="bio" className="text-sm font-bold text-textMain">
              {t("profileForm.aboutMe")} <span className="text-textMuted font-normal ml-1">- {t("profileForm.aboutMeHint")}</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              placeholder={t("profileForm.bioPlaceholder")}
              value={form.bio}
              onChange={handleFormChange}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-200 bg-background px-4 py-3 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>
        </section>

        {/* --- SECTION 2: PERSONAL DETAILS --- */}
        <section className="py-8 border-b border-gray-100">
          <h3 className="text-lg font-bold text-textMain mb-5">{t("profileForm.personalDetails")}</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-bold text-textMain" htmlFor="name">
                {t("profileForm.fullName")}
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  disabled={isSubmitting}
                  className={`w-full rounded-xl border bg-background pl-11 pr-4 py-3 outline-none transition-all ${errors.name ? "border-red-500" : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"}`}
                />
              </div>
              <ErrorMsg msg={errors.name} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-textMain" htmlFor="email">
                {t("profileForm.emailAddress")}
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  disabled={isSubmitting}
                  className={`w-full rounded-xl border bg-background pl-11 pr-4 py-3 outline-none transition-all ${errors.email ? "border-red-500" : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"}`}
                />
              </div>
              <ErrorMsg msg={errors.email} />
              <p className="text-xs text-textMuted">{t("profileForm.emailChangeHint")}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-textMain" htmlFor="phone">
                {t("profileForm.phoneNumber")}
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleFormChange}
                  disabled={isSubmitting}
                  className={`w-full rounded-xl border bg-background pl-11 pr-4 py-3 outline-none transition-all ${errors.phone ? "border-red-500" : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"}`}
                />
              </div>
              <ErrorMsg msg={errors.phone} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-textMain" htmlFor="location">
                {t("profileForm.mainLocation")}
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleFormChange}
                  disabled={isSubmitting}
                  className={`w-full rounded-xl border bg-background pl-11 pr-4 py-3 outline-none transition-all ${errors.location ? "border-red-500" : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"}`}
                />
              </div>
              <ErrorMsg msg={errors.location} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-textMain" htmlFor="preferredCurrency">
                {t("profileForm.preferredCurrency")}
              </label>
              <div className="relative">
                <Globe className="w-5 h-5 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
                <CurrencySelect
                  id="preferredCurrency"
                  name="preferredCurrency"
                  value={form.preferredCurrency}
                  onChange={(value) => setForm((prev) => ({ ...prev, preferredCurrency: value }))}
                  options={availableCurrencies}
                  withNames
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-gray-200 bg-background pl-11 pr-4 py-3 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 cursor-pointer appearance-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-textMuted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: SECURITY (PASSWORD) --- */}
        <section className="pt-8">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-textMain">{t("profileForm.security")}</h3>
            <p className="text-sm text-textMuted">{t("profileForm.securityHint")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-textMain" htmlFor="currentPassword">
                {t("profileForm.currentPassword")}
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  disabled={isSubmitting}
                  className={`w-full md:w-1/2 rounded-xl border bg-background pl-11 pr-4 py-3 outline-none transition-all ${errors.currentPassword ? "border-red-500" : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"}`}
                />
              </div>
              <ErrorMsg msg={errors.currentPassword} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-textMain" htmlFor="newPassword">
                {t("profileForm.newPassword")}
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  disabled={isSubmitting}
                  className={`w-full rounded-xl border bg-background pl-11 pr-4 py-3 outline-none transition-all ${errors.newPassword ? "border-red-500" : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"}`}
                />
              </div>
              <ErrorMsg msg={errors.newPassword} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-textMain" htmlFor="confirmPassword">
                {t("profileForm.confirmNewPassword")}
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  disabled={isSubmitting}
                  className={`w-full rounded-xl border bg-background pl-11 pr-4 py-3 outline-none transition-all ${errors.confirmPassword ? "border-red-500" : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"}`}
                />
              </div>
              <ErrorMsg msg={errors.confirmPassword} />
            </div>
          </div>
        </section>
      </div>

      {/* SAVE ACTIONS: sticky on mobile, normal on desktop */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 p-4 z-50 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] md:static md:bg-transparent md:border-0 md:p-0 md:shadow-none md:flex md:justify-end md:pt-4">
        <button
          type="submit"
          disabled={isSubmitting || uploadingPic}
          className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-10 py-3.5 text-lg font-bold text-white shadow-md transition-all hover:bg-primaryHover hover:shadow-lg hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-primary/60 disabled:hover:translate-y-0"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t("profileForm.saving")}
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {t("profileForm.saveChanges")}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
