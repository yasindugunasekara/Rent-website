"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
// Added modern icons for the UI
import { ImagePlus, AlertCircle } from "lucide-react";
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
  formId, // Receives the formId from the parent page
  initialValues,
  onSubmit,
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
    // Clear error when user starts typing
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setForm((prev) => ({ ...prev, image: objectUrl }));
    if (errors.image) setErrors((prev) => ({ ...prev, image: null }));
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
    if (!form.image) nextErrors.image = "Please upload an image.";
    
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  // Helper component for error messages
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
    // IMPORTANT: formId is assigned here so the external sticky button can trigger this form
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
            placeholder="Describe the item, its condition, and any rules for renting..."
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
              min="1"
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

      {/* --- IMAGE UPLOAD (Modern Style) --- */}
      <section className="space-y-3">
        <label className="text-sm font-bold text-textMain flex justify-between items-center">
          <span>Upload Image <span className="text-red-500">*</span></span>
        </label>
        
        <label 
          htmlFor="image" 
          className={`relative flex flex-col items-center justify-center w-full h-56 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden
            ${errors.image ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-background hover:border-primary hover:bg-primary/5'}`}
        >
          {imagePreview ? (
            <>
              <Image src={imagePreview} alt="Preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-medium">Change Image</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-white p-4 rounded-full shadow-sm mb-3">
                <ImagePlus className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm font-bold text-textMain mb-1">Click to upload image</p>
              <p className="text-xs text-textMuted">PNG, JPG or WEBP (Max 5MB)</p>
            </div>
          )}
          <input
            id="image"
            type="file"
            accept="image/*"
            disabled={isSubmitting}
            onChange={handleImageChange}
            className="hidden" // Hiding the ugly default file input
          />
        </label>
        <ErrorMsg msg={errors.image} />
      </section>

      {/* --- AVAILABILITY TOGGLE (Modern Switch) --- */}
      <section className="flex items-center justify-between rounded-2xl bg-background border border-gray-100 px-6 py-5">
        <div>
          <p className="text-base font-bold text-textMain">Item Availability</p>
          <p className="text-sm text-textMuted">Allow users to see and rent this item immediately.</p>
        </div>
        
        {/* Custom Toggle Switch */}
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

      {/* ⚠️ THE YELLOW BUTTON HAS BEEN COMPLETELY REMOVED FROM HERE ⚠️ */}
      {/* The form submission is now handled exclusively by the Sticky Bottom Bar in CreateAdPage.jsx */}
      
    </form>
  );
}