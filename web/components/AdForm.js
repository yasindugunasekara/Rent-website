"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { ImagePlus, AlertCircle, X, MapPin, Loader2 } from "lucide-react";
import { categoryOptions } from "@/lib/data";
import { sanitizePhone, sanitizeText } from "@/lib/sanitize";
import { useDashboard } from "@/lib/DashboardContext";
import { uploadImages, ApiClientError } from "@/lib/api-client";

// Dynamically import LocationPicker with SSR disabled
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-gray-100 dark:bg-zinc-800 rounded-2xl animate-pulse flex flex-col items-center justify-center text-textMuted">
      <MapPin className="w-8 h-8 mb-2 opacity-20" />
      <p className="text-sm font-medium">Loading Interactive Map...</p>
    </div>
  ),
});

const MAX_IMAGES = 8;

// Hoisted out of AdForm so it's a stable component identity across renders
// (defining a component inside a render function recreates its type every
// render, forcing React to remount it instead of just updating props).
function ErrorMsg({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5 text-red-500 text-sm font-medium animate-fadeIn">
      <AlertCircle className="w-4 h-4" />
      <span>{msg}</span>
    </div>
  );
}

const initialForm = {
  title: "",
  description: "",
  price: "",
  location: "", // Stores the readable address
  latitude: null,
  longitude: null,
  category: "",
  images: [], // { key, url }
  contactNumber: "",
  available: true,
};

export default function AdForm({
  formId,
  initialValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Submit",
  submitIcon: SubmitIcon,
}) {
  const { currency, exchangeRate } = useDashboard();
  const [form, setForm] = useState({
    ...initialForm,
    ...initialValues,
    // Existing images (from a prior GET) are identified by `id`; newly
    // uploaded ones (added below) are identified by `key`, the storage
    // object key from POST /api/uploads. `localKey` is purely a React list
    // key / removal handle and is stripped before the payload is sent.
    images: initialValues?.images?.map((img) => ({ localKey: `id-${img.id}`, id: img.id, url: img.url })) ?? [],
  });
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Sync price with exchange rate when editing or when currency changes
  useEffect(() => {
    if (initialValues?.price) {
      const convertedPrice = initialValues.price * exchangeRate;
      const roundedPrice = Math.round(convertedPrice / 10) * 10;
      setForm((prev) => ({ ...prev, price: roundedPrice }));
    }
  }, [initialValues?.price, exchangeRate]);

  const descriptionCount = useMemo(() => form.description.length, [form.description]);

  const handleChange = useCallback(
    (event) => {
      const { name, value, type, checked } = event.target;
      const nextValue = type === "checkbox" ? checked : value;
      setForm((prev) => ({ ...prev, [name]: nextValue }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    },
    [errors],
  );

  const handleLocationSelect = useCallback(
    (locationData) => {
      setForm((prev) => ({
        ...prev,
        location: locationData.address,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      }));
      if (errors.location) setErrors((prev) => ({ ...prev, location: null }));
    },
    [errors],
  );

  const handleFilesSelected = useCallback(
    async (event) => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = ""; // allow re-selecting the same file later
      if (files.length === 0) return;

      const room = MAX_IMAGES - form.images.length;
      if (room <= 0) {
        setErrors((prev) => ({ ...prev, images: `You can upload at most ${MAX_IMAGES} images.` }));
        return;
      }
      const toUpload = files.slice(0, room);

      setUploading(true);
      setErrors((prev) => ({ ...prev, images: null }));
      try {
        const { files: uploaded } = await uploadImages(toUpload);
        const next = uploaded.map((f) => ({ localKey: f.key, key: f.key, url: f.url }));
        setForm((prev) => ({ ...prev, images: [...prev.images, ...next] }));
      } catch (err) {
        const message = err instanceof ApiClientError ? err.message : "Upload failed. Please try again.";
        setErrors((prev) => ({ ...prev, images: message }));
      } finally {
        setUploading(false);
      }
    },
    [form.images.length],
  );

  const removeImage = useCallback((localKey) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((img) => img.localKey !== localKey) }));
  }, []);

  const validate = () => {
    const nextErrors = {};
    if (!sanitizeText(form.title)) nextErrors.title = "Title is required.";
    if (!sanitizeText(form.description)) nextErrors.description = "Description is required.";
    if (!Number(form.price) || Number(form.price) <= 0) nextErrors.price = "Enter a valid price.";
    if (!sanitizeText(form.location)) nextErrors.location = "Please select a location on the map.";
    if (!sanitizeText(form.category)) nextErrors.category = "Category is required.";
    if (!sanitizePhone(form.contactNumber))
      nextErrors.contactNumber = "Valid contact number is required.";
    if (form.images.length === 0) nextErrors.images = "At least one image is required.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    const payload = { ...form, images: form.images.map(({ localKey, ...rest }) => rest) };
    await onSubmit(payload);
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-8">
      {/* --- BASIC INFORMATION --- */}
      <section className="space-y-5">
        <h3 className="text-lg font-bold text-textMain border-b border-gray-100 dark:border-zinc-800 pb-2">Basic Information</h3>

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-bold text-textMain">
            Item Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            disabled={isSubmitting}
            placeholder="e.g. Sony Alpha A7III Camera"
            value={form.title}
            onChange={handleChange}
            className={`w-full rounded-xl border bg-background px-4 py-3 outline-none transition-all duration-200
              ${errors.title ? "border-red-500 focus:ring-red-500/20" : "border-gray-200 dark:border-zinc-700 focus:border-primary focus:ring-4 focus:ring-primary/10"}`}
          />
          <ErrorMsg msg={errors.title} />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-bold text-textMain">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            disabled={isSubmitting}
            rows={4}
            placeholder="Describe the item..."
            value={form.description}
            onChange={handleChange}
            className={`w-full rounded-xl border bg-background px-4 py-3 outline-none transition-all duration-200
              ${errors.description ? "border-red-500 focus:ring-red-500/20" : "border-gray-200 dark:border-zinc-700 focus:border-primary focus:ring-4 focus:ring-primary/10"}`}
          />
          <div className="flex justify-between items-center mt-1">
            <ErrorMsg msg={errors.description} />
            <p className={`text-xs font-medium ml-auto ${descriptionCount > 450 ? "text-red-500" : "text-textMuted"}`}>
              {descriptionCount}/5000
            </p>
          </div>
        </div>
      </section>

      {/* --- PRICING & CONTACT --- */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-bold text-textMain">
            Price (per day) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted font-bold text-xs">{currency}</span>
            <input
              id="price"
              type="number"
              name="price"
              disabled={isSubmitting}
              placeholder="0.00"
              value={form.price}
              onChange={handleChange}
              className={`w-full rounded-xl border bg-background pl-14 pr-4 py-3 outline-none transition-all duration-200
                ${errors.price ? "border-red-500 focus:ring-red-500/20" : "border-gray-200 dark:border-zinc-700 focus:border-primary focus:ring-4 focus:ring-primary/10"}`}
            />
          </div>
          <ErrorMsg msg={errors.price} />
        </div>

        <div className="space-y-2">
          <label htmlFor="contactNumber" className="text-sm font-bold text-textMain">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            id="contactNumber"
            name="contactNumber"
            disabled={isSubmitting}
            placeholder="+1 (555) 000-0000"
            value={form.contactNumber}
            onChange={handleChange}
            className={`w-full rounded-xl border bg-background px-4 py-3 outline-none transition-all duration-200
              ${errors.contactNumber ? "border-red-500 focus:ring-red-500/20" : "border-gray-200 dark:border-zinc-700 focus:border-primary focus:ring-4 focus:ring-primary/10"}`}
          />
          <ErrorMsg msg={errors.contactNumber} />
        </div>
      </section>

      {/* --- CATEGORY --- */}
      <section className="space-y-2">
        <label htmlFor="category" className="text-sm font-bold text-textMain">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          name="category"
          disabled={isSubmitting}
          value={form.category}
          onChange={handleChange}
          className={`w-full rounded-xl border bg-background px-4 py-3 outline-none transition-all duration-200 cursor-pointer
            ${errors.category ? "border-red-500 focus:ring-red-500/20" : "border-gray-200 dark:border-zinc-700 focus:border-primary focus:ring-4 focus:ring-primary/10"}`}
        >
          <option value="">Select category</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <ErrorMsg msg={errors.category} />
      </section>

      {/* --- SMART LOCATION PICKER --- */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-textMain border-b border-gray-100 dark:border-zinc-800 pb-2">Location Details</h3>
        <p className="text-sm text-textMuted">Search or pinpoint your item&apos;s location on the map.</p>

        <LocationPicker
          onLocationSelect={handleLocationSelect}
          initialLocation={form.latitude ? { lat: form.latitude, lng: form.longitude } : null}
          initialAddress={form.location}
        />
        <ErrorMsg msg={errors.location} />
      </section>

      {/* --- IMAGES --- */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2">
          <h3 className="text-lg font-bold text-textMain">Item Images</h3>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isSubmitting || form.images.length >= MAX_IMAGES}
            className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primaryHover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            {uploading ? "Uploading..." : "Add Images"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            hidden
            onChange={handleFilesSelected}
          />
        </div>
        <p className="text-xs text-textMuted">Up to {MAX_IMAGES} images, 5MB each. JPEG, PNG, WebP, or AVIF.</p>

        {form.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {form.images.map((img) => (
              <div
                key={img.localKey}
                className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="Item" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(img.localKey)}
                  disabled={isSubmitting}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <ErrorMsg msg={errors.images} />
      </section>

      {/* --- AVAILABILITY TOGGLE --- */}
      <section className="flex items-center justify-between rounded-2xl bg-background border border-gray-100 dark:border-zinc-800 px-6 py-5">
        <div>
          <p className="text-base font-bold text-textMain">Item Availability</p>
          <p className="text-sm text-textMuted">Allow users to see and rent this item immediately.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="available"
            checked={form.available}
            onChange={handleChange}
            disabled={isSubmitting}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-gray-200 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-success/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-success"></div>
        </label>
      </section>

      {/* --- SUBMIT BUTTON --- */}
      <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
        <button
          type="submit"
          disabled={isSubmitting || uploading}
          className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primaryHover disabled:bg-primary/60 text-white text-lg font-bold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {SubmitIcon && <SubmitIcon className="w-6 h-6" />}
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
