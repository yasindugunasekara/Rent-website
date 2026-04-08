"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { categoryOptions, locationOptions } from "@/lib/data";
import { sanitizePhone, sanitizeText } from "@/lib/sanitize";

const initialForm = {
  title: "",
  description: "",
  price: "",
  location: "",
  category: "",
  image: "",
  contactNumber: "",
  available: true,
};

export default function AdForm({
  initialValues,
  onSubmit,
  submitLabel = "Publish Ad",
  isSubmitting,
}) {
  const [form, setForm] = useState({ ...initialForm, ...initialValues });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(initialValues?.image || "");

  const descriptionCount = useMemo(() => form.description.length, [form.description]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setForm((prev) => ({ ...prev, image: objectUrl }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!sanitizeText(form.title)) nextErrors.title = "Title is required.";
    if (!sanitizeText(form.description)) nextErrors.description = "Description is required.";
    if (!Number(form.price) || Number(form.price) <= 0) nextErrors.price = "Enter a valid price.";
    if (!sanitizeText(form.location)) nextErrors.location = "Location is required.";
    if (!sanitizeText(form.category)) nextErrors.category = "Category is required.";
    if (!sanitizePhone(form.contactNumber))
      nextErrors.contactNumber = "Contact number is required.";
    if (!form.image) nextErrors.image = "Please upload an image.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl bg-white p-5 shadow-md md:p-6"
    >
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#0B3D2E]">Basic Information</h2>
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-zinc-700">
            Item Title
          </label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none transition focus:border-[#5C8A64]"
          />
          {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-zinc-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none transition focus:border-[#5C8A64]"
          />
          <p className="text-xs text-zinc-500">{descriptionCount}/500 characters</p>
          {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium text-zinc-700">
            Price
          </label>
          <input
            id="price"
            type="number"
            min="1"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none transition focus:border-[#5C8A64]"
          />
          {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="contactNumber" className="text-sm font-medium text-zinc-700">
            Contact Number
          </label>
          <input
            id="contactNumber"
            name="contactNumber"
            value={form.contactNumber}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none transition focus:border-[#5C8A64]"
          />
          {errors.contactNumber && (
            <p className="text-sm text-red-600">{errors.contactNumber}</p>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium text-zinc-700">
            Location
          </label>
          <select
            id="location"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none transition focus:border-[#5C8A64]"
          >
            <option value="">Select location</option>
            {locationOptions.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium text-zinc-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 outline-none transition focus:border-[#5C8A64]"
          >
            <option value="">Select category</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
        </div>
      </section>

      <section className="space-y-3">
        <label htmlFor="image" className="text-sm font-medium text-zinc-700">
          Upload Image
        </label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-zinc-700"
        />
        {errors.image && <p className="text-sm text-red-600">{errors.image}</p>}

        {imagePreview && (
          <div className="relative h-40 overflow-hidden rounded-xl">
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}
      </section>

      <section className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2">
        <p className="text-sm font-medium text-zinc-700">Availability</p>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            name="available"
            checked={form.available}
            onChange={handleChange}
            className="h-4 w-4 accent-[#0B3D2E]"
          />
          <span className="text-sm text-zinc-600">
            {form.available ? "Available" : "Not available"}
          </span>
        </label>
      </section>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-[#F4B400] px-4 py-2.5 font-semibold text-[#0B3D2E] transition hover:bg-[#dfa600] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
