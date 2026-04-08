"use client";

import { useState } from "react";
import { sanitizePhone, sanitizeText } from "@/lib/sanitize";

export default function ProfileForm({ initialValues, onSubmit, isSubmitting }) {
  const [form, setForm] = useState(initialValues);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!sanitizeText(form.name)) nextErrors.name = "Name is required.";
    if (!sanitizeText(form.email) || !form.email.includes("@"))
      nextErrors.email = "Enter a valid email.";
    if (!sanitizePhone(form.phone)) nextErrors.phone = "Phone is required.";
    if (!sanitizeText(form.location)) nextErrors.location = "Location is required.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
    setSuccess("Profile updated successfully.");
    setTimeout(() => setSuccess(""), 2500);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-xl space-y-4 rounded-2xl bg-white p-5 shadow-md md:p-6"
    >
      <h2 className="text-lg font-semibold text-[#0B3D2E]">My Profile</h2>
      {success && <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>}

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none transition focus:border-[#5C8A64]"
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none transition focus:border-[#5C8A64]"
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="phone">
          Phone number
        </label>
        <input
          id="phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none transition focus:border-[#5C8A64]"
        />
        {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="location">
          Location
        </label>
        <input
          id="location"
          name="location"
          value={form.location}
          onChange={handleChange}
          className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none transition focus:border-[#5C8A64]"
        />
        {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-[#0B3D2E] px-4 py-2.5 font-semibold text-white transition hover:bg-[#0f4a37] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Updating..." : "Update Profile"}
      </button>
    </form>
  );
}
