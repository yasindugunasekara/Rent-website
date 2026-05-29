"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ImagePlus, AlertCircle, X, PlusCircle } from "lucide-react";
import { categoryOptions, locationOptions } from "@/lib/data";
import { sanitizePhone, sanitizeText } from "@/lib/sanitize";

const initialForm = {
  title: "",
  description: "",
  price: "",
  location: "",
  category: "",
  imageUrls: [""], // Changed from 'image' to 'imageUrls' array
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

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleImageUrlChange = (index, value) => {
    const nextUrls = [...form.imageUrls];
    nextUrls[index] = value;
    setForm((prev) => ({ ...prev, imageUrls: nextUrls }));
    if (errors.imageUrls) setErrors((prev) => ({ ...prev, imageUrls: null }));
  };

  const addImageField = () => {
    setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ""] }));
  };

  const removeImageField = (index) => {
    if (form.imageUrls.length <= 1) return;
    const nextUrls = form.imageUrls.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, imageUrls: nextUrls }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!sanitizeText(form.title)) nextErrors.title = "Title is required.";
    if (!sanitizeText(form.description)) nextErrors.description = "Description is required.";
    if (!Number(form.price) || Number(form.price) <= 0) nextErrors.price = "Enter a valid price.";
    if (!sanitizeText(form.location)) nextErrors.location = "Location is required.";
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
    
    // Clean up empty URLs before submitting
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
        <h3 className="text-lg font-bold text-textMain border-b border-gray-100 pb-2">Basic Information</h3>
        
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
              ${errors.title ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
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
              ${errors.description ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
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
                ${errors.price ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
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
              ${errors.contactNumber ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
          />
          <ErrorMsg msg={errors.contactNumber} />
        </div>
      </section>

      {/* --- CATEGORY & LOCATION --- */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-bold text-textMain">
            Location <span className="text-red-500">*</span>
          </label>
          <select
            id="location"
            name="location"
            disabled={isSubmitting}
            value={form.location}
            onChange={handleChange}
            className={`w-full rounded-xl border bg-background px-4 py-3 outline-none transition-all duration-200 cursor-pointer
              ${errors.location ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
          >
            <option value="">Select location</option>
            {locationOptions.map((location) => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
          <ErrorMsg msg={errors.location} />
        </div>

        <div className="space-y-2">
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
              ${errors.category ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
          >
            <option value="">Select category</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <ErrorMsg msg={errors.category} />
        </div>
      </section>

      {/* --- MULTIPLE IMAGES --- */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
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
                    className="w-full rounded-xl border border-gray-200 bg-background px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
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
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
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
      <section className="flex items-center justify-between rounded-2xl bg-background border border-gray-100 px-6 py-5">
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
          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-success/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-success"></div>
        </label>
      </section>
      
    </form>
  );
}
