"use client";

import { useMemo, useState, useCallback } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ImagePlus, AlertCircle, X, PlusCircle, MapPin } from "lucide-react";
import { categoryOptions, locationOptions } from "@/lib/data";
import { sanitizePhone, sanitizeText } from "@/lib/sanitize";

// Dynamically import LocationPicker with SSR disabled
const LocationPicker = dynamic(
  () => import("@/components/LocationPicker"),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-[400px] w-full bg-gray-100 dark:bg-zinc-800 rounded-2xl animate-pulse flex flex-col items-center justify-center text-textMuted">
        <MapPin className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-sm font-medium">Loading Interactive Map...</p>
      </div>
    )
  }
);

const initialForm = {
  title: "",
  description: "",
  price: "",
  location: "", // Stores the readable address
  latitude: null,
  longitude: null,
  category: "",
  imageUrls: [""],
  contactNumber: "",
  available: true,
};

export default function AdForm({
  formId,
  initialValues,
  onSubmit,
  isSubmitting,
}) {
  const [form, setForm] = useState({ 
    ...initialForm, 
    ...initialValues,
    imageUrls: initialValues?.images?.map(img => img.imageUrl) || [""]
  });
  const [errors, setErrors] = useState({});

  const descriptionCount = useMemo(() => form.description.length, [form.description]);

  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  }, [errors]);

  const handleLocationSelect = useCallback((locationData) => {
    setForm((prev) => ({
      ...prev,
      location: locationData.address,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    }));
    if (errors.location) setErrors((prev) => ({ ...prev, location: null }));
  }, [errors]);

  const handleImageUrlChange = useCallback((index, value) => {
    const nextUrls = [...form.imageUrls];
    nextUrls[index] = value;
    setForm((prev) => ({ ...prev, imageUrls: nextUrls }));
    if (errors.imageUrls) setErrors((prev) => ({ ...prev, imageUrls: null }));
  }, [errors, form.imageUrls]);

  const addImageField = useCallback(() => {
    setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ""] }));
  }, []);

  const removeImageField = useCallback((index) => {
    if (form.imageUrls.length <= 1) return;
    const nextUrls = form.imageUrls.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, imageUrls: nextUrls }));
  }, [form.imageUrls]);

  const validate = () => {
    const nextErrors = {};
    if (!sanitizeText(form.title)) nextErrors.title = "Title is required.";
    if (!sanitizeText(form.description)) nextErrors.description = "Description is required.";
    if (!Number(form.price) || Number(form.price) <= 0) nextErrors.price = "Enter a valid price.";
    if (!sanitizeText(form.location)) nextErrors.location = "Please select a location on the map.";
    if (!sanitizeText(form.category)) nextErrors.category = "Category is required.";
    if (!sanitizePhone(form.contactNumber))
      nextErrors.contactNumber = "Valid contact number is required.";
    
    const validUrls = form.imageUrls.filter(url => url.trim() !== "");
    if (validUrls.length === 0) nextErrors.imageUrls = "At least one image URL is required.";
    
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    
    const cleanedForm = {
      ...form,
      imageUrls: form.imageUrls.filter(url => url.trim() !== "")
    };
    await onSubmit(cleanedForm);
  };

  const ErrorMsg = ({ msg }) => {
    if (!msg) return null;
    return (
      <div className="flex items-center gap-1.5 mt-1.5 text-red-500 text-sm font-medium animate-fadeIn">
        <AlertCircle className="w-4 h-4" />
        <span>{msg}</span>
      </div>
    );
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
              ${errors.title ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-zinc-700 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
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
              ${errors.description ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-zinc-700 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
          />
          <div className="flex justify-between items-center mt-1">
            <ErrorMsg msg={errors.description} />
            <p className={`text-xs font-medium ml-auto ${descriptionCount > 450 ? 'text-red-500' : 'text-textMuted'}`}>
              {descriptionCount}/500
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
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted font-bold">$</span>
            <input
              id="price"
              type="number"
              name="price"
              disabled={isSubmitting}
              placeholder="0.00"
              value={form.price}
              onChange={handleChange}
              className={`w-full rounded-xl border bg-background pl-8 pr-4 py-3 outline-none transition-all duration-200 
                ${errors.price ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-zinc-700 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
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
              ${errors.contactNumber ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-zinc-700 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
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
            ${errors.category ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-zinc-700 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
        >
          <option value="">Select category</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <ErrorMsg msg={errors.category} />
      </section>

      {/* --- SMART LOCATION PICKER --- */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-textMain border-b border-gray-100 dark:border-zinc-800 pb-2">Location Details</h3>
        <p className="text-sm text-textMuted">Search or pinpoint your item's location on the map.</p>
        
        <LocationPicker 
          onLocationSelect={handleLocationSelect} 
          initialLocation={form.latitude ? { lat: form.latitude, lng: form.longitude } : null}
          initialAddress={form.location}
        />
        <ErrorMsg msg={errors.location} />
      </section>

      {/* --- MULTIPLE IMAGES --- */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2">
          <h3 className="text-lg font-bold text-textMain">Item Images</h3>
          <button
            type="button"
            onClick={addImageField}
            className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primaryHover transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Image URL
          </button>
        </div>

        <div className="space-y-4">
          {form.imageUrls.map((url, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1 space-y-2">
                <div className="relative">
                  <input
                    placeholder="https://example.com/image.jpg"
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-background px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                  {form.imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {url && (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <ErrorMsg msg={errors.imageUrls} />
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
      
    </form>
  );
}
