'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';

// --- Custom 3D-style SVG illustrated icons ---

// Vehicles (SUV Icon)
const VehiclesIcon = () => (
  <svg className="w-10 h-10 drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="suvBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1E3A8A" />
      </linearGradient>
      <linearGradient id="wheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4B5563" />
        <stop offset="100%" stopColor="#111827" />
      </linearGradient>
      <linearGradient id="windshieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.4" />
      </linearGradient>
      <filter id="suvShadow" x="-10%" y="-10%" width="120%" height="125%">
        <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.15" />
      </filter>
    </defs>
    {/* Ground Shadow */}
    <ellipse cx="32" cy="52" rx="24" ry="4" fill="#000000" fillOpacity="0.2" />
    
    {/* SUV Body */}
    <g filter="url(#suvShadow)">
      {/* Roof & Pillars */}
      <path d="M16 28 L24 16 L46 16 L52 28 Z" fill="url(#suvBodyGrad)" />
      {/* Front Windshield */}
      <path d="M44 18 L50 27 H38 L36 18 Z" fill="url(#windshieldGrad)" />
      {/* Side Windows */}
      <path d="M25 18 H34 L36 27 H22 Z" fill="url(#windshieldGrad)" />
      {/* Lower Main Chassis */}
      <path d="M6 28 H58 C60 28 61 29 61 31 L58 46 C58 48 56 49 54 49 H10 C8 49 6 48 6 46 L3 31 C3 29 4 28 6 28 Z" fill="url(#suvBodyGrad)" />
      {/* Wheel Arches */}
      <path d="M12 49 C12 43 20 43 20 49" stroke="#1F2937" strokeWidth="3" fill="none" />
      <path d="M44 49 C44 43 52 43 52 49" stroke="#1F2937" strokeWidth="3" fill="none" />
      {/* Front Headlight (3D glow effect) */}
      <circle cx="58" cy="35" r="3" fill="#FBBF24" />
      <path d="M58 35 L64 32 V38 Z" fill="#FBBF24" fillOpacity="0.3" />
      {/* Grill & bumper */}
      <rect x="56" y="39" width="3" height="6" rx="1.5" fill="#9CA3AF" />
    </g>

    {/* Wheels */}
    <circle cx="16" cy="49" r="7" fill="url(#wheelGrad)" />
    <circle cx="16" cy="49" r="3" fill="#E5E7EB" />
    <circle cx="48" cy="49" r="7" fill="url(#wheelGrad)" />
    <circle cx="48" cy="49" r="3" fill="#E5E7EB" />
  </svg>
);

// Cameras (DSLR Camera Icon)
const CamerasIcon = () => (
  <svg className="w-10 h-10 drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cameraBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#374151" />
        <stop offset="100%" stopColor="#111827" />
      </linearGradient>
      <linearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4B5563" />
        <stop offset="50%" stopColor="#1F2937" />
        <stop offset="100%" stopColor="#030712" />
      </linearGradient>
      <radialGradient id="lensGlass" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="30%" stopColor="#0284C7" />
        <stop offset="70%" stopColor="#1E3A8A" />
        <stop offset="100%" stopColor="#0B132B" />
      </radialGradient>
      <linearGradient id="lensReflect" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
        <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="32" cy="53" rx="22" ry="3.5" fill="#000000" fillOpacity="0.25" />

    {/* Camera Body */}
    <path d="M12 20 C12 18 14 16 16 16 H24 L27 12 H37 L40 16 H48 C50 16 52 18 52 20 V46 C52 48 50 50 48 50 H16 C14 50 12 48 12 46 Z" fill="url(#cameraBodyGrad)" />
    {/* Grip panel (3D textured feel) */}
    <path d="M14 22 V44 C14 46 15 47 17 47 H22 V20 H17 C15 20 14 21 14 22 Z" fill="#1F2937" />
    <line x1="17" y1="24" x2="20" y2="24" stroke="#111827" strokeWidth="2" />
    <line x1="17" y1="28" x2="20" y2="28" stroke="#111827" strokeWidth="2" />
    <line x1="17" y1="32" x2="20" y2="32" stroke="#111827" strokeWidth="2" />
    <line x1="17" y1="36" x2="20" y2="36" stroke="#111827" strokeWidth="2" />

    {/* Red Ring Highlight */}
    <path d="M22 34 C22 26.2 28.2 20 36 20 C43.8 20 50 26.2 50 34 C50 41.8 43.8 48 36 48 C28.2 48 22 41.8 22 34 Z" fill="#EF4444" />
    
    {/* Lens Barrel */}
    <path d="M23 34 C23 26.8 28.8 21 36 21 C43.2 21 49 26.8 49 34 C49 41.2 43.2 47 36 47 C28.8 47 23 41.2 23 34 Z" fill="url(#lensGrad)" />
    {/* Inner Lens Glass */}
    <circle cx="36" cy="34" r="11" fill="url(#lensGlass)" />
    <circle cx="34" cy="32" r="9" fill="url(#lensReflect)" opacity="0.6" />
    
    {/* Shutter Button & Dial */}
    <rect x="16" y="12" width="6" height="4" rx="1" fill="#9CA3AF" />
    <circle cx="47" cy="13" r="2.5" fill="#6B7280" />
    
    {/* Flash hot shoe & Viewfinder */}
    <rect x="29" y="10" width="6" height="2" rx="0.5" fill="#E5E7EB" />
    <rect x="28" y="14" width="8" height="2" fill="#E5E7EB" />
  </svg>
);

// Electronics (Laptop Icon)
const ElectronicsIcon = () => (
  <svg className="w-10 h-10 drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="laptopScreen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="50%" stopColor="#818CF8" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
      <linearGradient id="laptopBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#D1D5DB" />
        <stop offset="100%" stopColor="#9CA3AF" />
      </linearGradient>
      <linearGradient id="laptopBase" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#E5E7EB" />
        <stop offset="100%" stopColor="#4B5563" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="32" cy="52" rx="26" ry="3.5" fill="#000000" fillOpacity="0.2" />

    {/* Screen Shell */}
    <rect x="12" y="12" width="40" height="26" rx="3" fill="#374151" />
    <rect x="14" y="14" width="36" height="22" rx="1" fill="url(#laptopScreen)" />
    
    {/* Shiny screen reflection */}
    <path d="M14 14 L36 14 L14 36 Z" fill="#FFFFFF" fillOpacity="0.15" />
    
    {/* Code widgets / design on screen */}
    <rect x="18" y="18" width="10" height="4" rx="1" fill="#FFFFFF" fillOpacity="0.3" />
    <rect x="18" y="24" width="14" height="2" rx="0.5" fill="#FFFFFF" fillOpacity="0.4" />
    <rect x="18" y="28" width="8" height="2" rx="0.5" fill="#FFFFFF" fillOpacity="0.4" />
    <circle cx="43" cy="22" r="3" fill="#FFFFFF" fillOpacity="0.45" />

    {/* Laptop Hinge & Base */}
    <path d="M6 38 H58 V42 C58 45.3 55.3 48 52 48 H12 C8.7 48 6 45.3 6 42 V38 Z" fill="url(#laptopBase)" />
    <rect x="8" y="38" width="48" height="2" fill="url(#laptopBody)" />
    <rect x="10" y="40" width="44" height="4" rx="2" fill="#1F2937" fillOpacity="0.3" />
    <path d="M28 38 H36 V40 H28 Z" fill="#111827" />

    {/* Trackpad */}
    <rect x="26" y="43" width="12" height="4" rx="1" fill="#9CA3AF" />
  </svg>
);

// Tools (Power Drill Icon)
const ToolsIcon = () => (
  <svg className="w-10 h-10 drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="drillYellow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="drillMetal" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#9CA3AF" />
        <stop offset="100%" stopColor="#374151" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="34" cy="54" rx="20" ry="3.5" fill="#000000" fillOpacity="0.25" />

    {/* Drill Body */}
    {/* Battery Base */}
    <path d="M22 46 H38 L42 52 H18 Z" fill="#1F2937" />
    <rect x="22" y="49" width="16" height="3" fill="#D97706" />

    {/* Handle */}
    <path d="M24 30 L28 47 H34 L30 30 Z" fill="#1F2937" />
    {/* Handle Grip Textures */}
    <rect x="28.5" y="33" width="4" height="2" rx="0.5" fill="#9CA3AF" />
    <rect x="28" y="37" width="4" height="2" rx="0.5" fill="#9CA3AF" />
    <rect x="27.5" y="41" width="4" height="2" rx="0.5" fill="#9CA3AF" />

    {/* Main Motor Housing */}
    <path d="M12 18 C12 15.8 13.8 14 16 14 H40 C42.2 14 44 15.8 44 18 V28 H12 Z" fill="url(#drillYellow)" />
    {/* Motor Vents */}
    <rect x="16" y="17" width="2" height="7" rx="0.5" fill="#1F2937" />
    <rect x="20" y="17" width="2" height="7" rx="0.5" fill="#1F2937" />
    <rect x="24" y="17" width="2" height="7" rx="0.5" fill="#1F2937" />

    {/* Back Cap */}
    <path d="M12 14 V28 C10 28 8 26 8 24 V18 C8 16 10 14 12 14 Z" fill="#1F2937" />

    {/* Chuck / Torque Selector */}
    <path d="M40 16 H48 V26 H40 Z" fill="url(#drillMetal)" />
    <path d="M48 18 H52 V24 H48 Z" fill="#111827" />

    {/* Drill Bit */}
    <path d="M52 20 H61 C62 20 62 21 61 21 L52 22 Z" fill="#9CA3AF" />
    <line x1="53" y1="21" x2="59" y2="21" stroke="#374151" strokeWidth="1" strokeDasharray="1 1" />

    {/* Trigger */}
    <path d="M24 24 C24 24 21 24.5 21 26 C21 27.5 24 28 24 28" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </svg>
);

// Homes (House Icon)
const HomesIcon = () => (
  <svg className="w-10 h-10 drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#991B1B" />
      </linearGradient>
      <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="32" cy="54" rx="22" ry="4" fill="#000000" fillOpacity="0.2" />

    {/* Chimney */}
    <rect x="42" y="16" width="6" height="12" fill="#78350F" />
    <path d="M40 16 H50 V18 H40 Z" fill="#451A03" />

    {/* Main Wall */}
    <path d="M14 28 H50 V50 C50 51.1 49.1 52 48 52 H16 C14.9 52 14 51.1 14 50 Z" fill="url(#wallGrad)" />

    {/* Roof (3D overlap) */}
    <path d="M10 28 L32 10 L54 28 H46 L32 16 L18 28 Z" fill="url(#roofGrad)" />
    <polygon points="32,10 54,28 50,28 32,13" fill="#FCA5A5" />

    {/* Door */}
    <path d="M28 40 H36 V52 H28 Z" fill="#78350F" />
    <circle cx="34" cy="46" r="1" fill="#FBBF24" />

    {/* Windows with Glow */}
    <rect x="18" y="32" width="7" height="7" rx="1.5" fill="#FEF08A" />
    <rect x="18" y="32" width="7" height="7" rx="1.5" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
    <line x1="21.5" y1="32" x2="21.5" y2="39" stroke="#F59E0B" strokeWidth="1.2" />
    <line x1="18" y1="35.5" x2="25" y2="35.5" stroke="#F59E0B" strokeWidth="1.2" />

    <rect x="39" y="32" width="7" height="7" rx="1.5" fill="#FEF08A" />
    <rect x="39" y="32" width="7" height="7" rx="1.5" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
    <line x1="42.5" y1="32" x2="42.5" y2="39" stroke="#F59E0B" strokeWidth="1.2" />
    <line x1="39" y1="35.5" x2="46" y2="35.5" stroke="#F59E0B" strokeWidth="1.2" />

    {/* Little Tree/Bush next to house */}
    <path d="M50 42 C48 42 46 44 46 46 C46 48 47.8 50 50 50 C52.2 50 54 48 54 46 C54 44 52 42 50 42 Z" fill="#10B981" />
    <rect x="49" y="50" width="2" height="2" fill="#78350F" />
  </svg>
);

// Travel (Suitcase Icon)
const TravelIcon = () => (
  <svg className="w-10 h-10 drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="suitcaseBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#0E7490" />
      </linearGradient>
      <linearGradient id="handleBarsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9CA3AF" />
        <stop offset="100%" stopColor="#4B5563" />
      </linearGradient>
      <filter id="suitcaseShadow" x="-10%" y="-10%" width="120%" height="125%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000" floodOpacity="0.15" />
      </filter>
    </defs>
    {/* Ground Shadow */}
    <ellipse cx="32" cy="52" rx="20" ry="3.5" fill="#000000" fillOpacity="0.2" />

    {/* Handle Bars */}
    <path d="M24 20V11C24 9.5 25.5 8 27 8H37C38.5 8 40 9.5 40 11V20" stroke="url(#handleBarsGrad)" strokeWidth="3" strokeLinecap="round" />
    <rect x="25" y="7" width="14" height="4" rx="1.5" fill="#1F2937" />

    {/* Suitcase Body */}
    <g filter="url(#suitcaseShadow)">
      <rect x="16" y="18" width="32" height="30" rx="5" fill="url(#suitcaseBodyGrad)" />
      
      {/* Corner Protectors */}
      <path d="M16 23C16 20.2 18.2 18 21 18H24V24H16V23Z" fill="#0891B2" />
      <path d="M48 23C48 20.2 45.8 18 43 18H40V24H48V23Z" fill="#0891B2" />
      <path d="M16 43V45C16 47.8 18.2 50 21 50H24V44H16V43Z" fill="#0891B2" />
      <path d="M48 43V45C48 47.8 45.8 50 43 50H40V44H48V43Z" fill="#0891B2" />

      {/* Vertical Ribs for texture */}
      <rect x="23" y="24" width="3" height="20" rx="1.5" fill="#0E7490" opacity="0.4" />
      <rect x="30" y="24" width="3" height="20" rx="1.5" fill="#0E7490" opacity="0.4" />
      <rect x="38" y="24" width="3" height="20" rx="1.5" fill="#0E7490" opacity="0.4" />

      {/* Main zipper path / line */}
      <line x1="32" y1="18" x2="32" y2="48" stroke="#1F2937" strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />

      {/* Stickers for a fun travel theme */}
      <circle cx="23" cy="35" r="4" fill="#FBBF24" />
      <path d="M21 35H25" stroke="#FFF" strokeWidth="0.8" />
      
      <rect x="39" y="32" width="5" height="8" rx="1" fill="#EF4444" transform="rotate(15 41.5 36)" />
      <circle cx="41.5" cy="34" r="0.8" fill="#FFF" />
    </g>

    {/* Wheels */}
    <circle cx="21" cy="50" r="3.5" fill="#1F2937" />
    <circle cx="21" cy="50" r="1.5" fill="#E5E7EB" />
    <circle cx="43" cy="50" r="3.5" fill="#1F2937" />
    <circle cx="43" cy="50" r="1.5" fill="#E5E7EB" />
  </svg>
);

// Music (Guitar Icon)
const MusicIcon = () => (
  <svg className="w-10 h-10 drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="guitarBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F97316" />
        <stop offset="40%" stopColor="#EA580C" />
        <stop offset="100%" stopColor="#7C2D12" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="25" cy="52" rx="16" ry="4" fill="#000000" fillOpacity="0.2" />

    {/* Guitar Body (drawn slightly rotated for dynamic look) */}
    <g transform="rotate(-15, 32, 32)">
      {/* Lower bout & Upper bout curves */}
      <path d="M20 22 C14 22 10 27 10 33 C10 40 14 43 18 43 C15 47 14 52 18 56 C22 60 30 60 34 56 C38 52 37 47 34 43 C38 43 42 40 42 33 C42 27 38 22 32 22 H20 Z" fill="url(#guitarBody)" />
      
      {/* Soundhole */}
      <circle cx="26" cy="38" r="5" fill="#111827" stroke="#FDE047" strokeWidth="1.5" />
      
      {/* Bridge */}
      <rect x="20" y="48" width="12" height="3" rx="1" fill="#451A03" />

      {/* Neck */}
      <rect x="24" y="2" width="4" height="22" fill="#7C2D12" />
      {/* Fretboard */}
      <rect x="25" y="2" width="2" height="22" fill="#1F2937" />
      <line x1="25" y1="6" x2="27" y2="6" stroke="#D1D5DB" strokeWidth="0.8" />
      <line x1="25" y1="10" x2="27" y2="10" stroke="#D1D5DB" strokeWidth="0.8" />
      <line x1="25" y1="14" x2="27" y2="14" stroke="#D1D5DB" strokeWidth="0.8" />
      <line x1="25" y1="18" x2="27" y2="18" stroke="#D1D5DB" strokeWidth="0.8" />

      {/* Headstock */}
      <path d="M23 -2 H29 V3 H23 Z" fill="#451A03" />
      <circle cx="22" cy="0" r="0.8" fill="#D1D5DB" />
      <circle cx="30" cy="0" r="0.8" fill="#D1D5DB" />
      <circle cx="22" cy="2" r="0.8" fill="#D1D5DB" />
      <circle cx="30" cy="2" r="0.8" fill="#D1D5DB" />

      {/* Strings */}
      <line x1="26" y1="2" x2="26" y2="48" stroke="#E5E7EB" strokeWidth="0.5" opacity="0.8" />
      <line x1="25.5" y1="2" x2="25.5" y2="48" stroke="#E5E7EB" strokeWidth="0.5" opacity="0.8" />
      <line x1="26.5" y1="2" x2="26.5" y2="48" stroke="#E5E7EB" strokeWidth="0.5" opacity="0.8" />
    </g>
  </svg>
);

// More (9-dot Grid Icon)
const MoreIcon = () => (
  <svg className="w-10 h-10 group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
    {/* 9-dot grid with 3D shadow and gradient */}
    <rect x="12" y="12" width="10" height="10" rx="3.5" fill="url(#dotGrad)" />
    <rect x="27" y="12" width="10" height="10" rx="3.5" fill="url(#dotGrad)" />
    <rect x="42" y="12" width="10" height="10" rx="3.5" fill="url(#dotGrad)" />
    
    <rect x="12" y="27" width="10" height="10" rx="3.5" fill="url(#dotGrad)" />
    <rect x="27" y="27" width="10" height="10" rx="3.5" fill="url(#dotGrad)" />
    <rect x="42" y="27" width="10" height="10" rx="3.5" fill="url(#dotGrad)" />
    
    <rect x="12" y="42" width="10" height="10" rx="3.5" fill="url(#dotGrad)" />
    <rect x="27" y="42" width="10" height="10" rx="3.5" fill="url(#dotGrad)" />
    <rect x="42" y="42" width="10" height="10" rx="3.5" fill="url(#dotGrad)" />
  </svg>
);

// --- Static Categories Definition ---

const CORE_CATEGORIES = [
  { id: 'travel', label: 'Travel', queryVal: 'travel', icon: <TravelIcon />, bgColor: 'bg-cyan-50/70 hover:bg-cyan-100/70', mobileVisible: true },
  { id: 'vehicles', label: 'Vehicles', queryVal: 'vehicles', icon: <VehiclesIcon />, bgColor: 'bg-blue-50/70 hover:bg-blue-100/70', mobileVisible: true },
  { id: 'electronics', label: 'Electronics', queryVal: 'electronics', icon: <ElectronicsIcon />, bgColor: 'bg-indigo-50/70 hover:bg-indigo-100/70' },
  { id: 'tools', label: 'Tools', queryVal: 'tools', icon: <ToolsIcon />, bgColor: 'bg-amber-50/70 hover:bg-amber-100/70' },
  { id: 'homes', label: 'Homes', queryVal: 'property', icon: <HomesIcon />, bgColor: 'bg-red-50/70 hover:bg-red-100/70' },
  { id: 'cameras', label: 'Cameras', queryVal: 'cameras', icon: <CamerasIcon />, bgColor: 'bg-gray-50/70 hover:bg-gray-100/70' },
  { id: 'music', label: 'Music', queryVal: 'music', icon: <MusicIcon />, bgColor: 'bg-orange-50/70 hover:bg-orange-100/70' },
];

const PANEL_CATEGORIES = [
  { label: 'Fashion', queryVal: 'fashion', iconName: 'hanger' },
  { label: 'Sports', queryVal: 'sports', iconName: 'ball' },
  { label: 'Books', queryVal: 'books', iconName: 'book' },
  { label: 'Gaming', queryVal: 'gaming', iconName: 'gamepad' },
  { label: 'Furniture', queryVal: 'furniture', iconName: 'chair' },
  { label: 'Appliances', queryVal: 'appliances', iconName: 'fridge' },
  { label: 'Drones', queryVal: 'drones', iconName: 'drone' },
  { label: 'Event Equipment', queryVal: 'events', iconName: 'mic' },
  { label: 'Camping Gear', queryVal: 'camping', iconName: 'tent' },
  { label: 'Audio Systems', queryVal: 'audio', iconName: 'speaker' },
  { label: 'Industrial Tools', queryVal: 'industrial', iconName: 'hammer' },
  { label: 'Photography Equipment', queryVal: 'photography', iconName: 'tripod' },
  { label: 'Kids & Toys', queryVal: 'toys', iconName: 'bear' },
  { label: 'Pets', queryVal: 'pets', iconName: 'paw' },
  { label: 'Outdoor', queryVal: 'sports', iconName: 'bicycle' },
  { label: 'Medical Equipment', queryVal: 'medical', iconName: 'kit' },
  { label: 'Construction Equipment', queryVal: 'construction', iconName: 'crane' }
];

const POPULAR_BADGES = [
  { label: '🔥 Popular', queryVal: '' },
  { label: '🚗 Cars', queryVal: 'vehicles' },
  { label: '💻 Laptops', queryVal: 'electronics' },
  { label: '🔧 Power Tools', queryVal: 'tools' },
  { label: '📷 DSLR', queryVal: 'cameras' },
  { label: '🏡 Apartments', queryVal: 'property' }
];

// Helper to render drawer icons based on identifier
const DrawerIcon = ({ type }) => {
  switch (type) {
    case 'hanger':
      return (
        <svg className="w-8 h-8 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="hangerGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#10B981"/><stop offset="100%" stopColor="#059669"/></linearGradient>
          </defs>
          {/* Hook */}
          <path d="M32 20 C32 15, 36 12, 34 8 C32 4, 28 6, 28 10" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          {/* Hanger Triangle */}
          <path d="M32 20 L12 36 C10 37, 11 39, 13 39 H51 C53 39, 54 37, 52 36 Z" fill="url(#hangerGrad)" />
          {/* Hanging Clothes silhouette */}
          <path d="M16 39 V52 H48 V39 Z" fill="#E5E7EB" opacity="0.7" />
        </svg>
      );
    case 'ball':
      return (
        <svg className="w-8 h-8 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="22" fill="#F97316" />
          <circle cx="32" cy="32" r="22" stroke="#111827" strokeWidth="2" />
          {/* Basketball seams */}
          <path d="M12 32 H52 M32 12 V52 M17 17 C26 26, 26 38, 17 47 M47 17 C38 26, 38 38, 47 47" stroke="#111827" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'book':
      return (
        <svg className="w-8 h-8 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
          <path d="M14 16 H44 V48 H14 Z" fill="#3B82F6" />
          <path d="M44 16 L50 20 V52 L44 48 Z" fill="#1D4ED8" />
          <path d="M14 48 H44 L50 52 H20 Z" fill="#9CA3AF" />
          {/* Gold emblem */}
          <circle cx="29" cy="32" r="4" fill="#FBBF24" />
        </svg>
      );
    case 'gamepad':
      return (
        <svg className="w-8 h-8 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
          <rect x="12" y="20" width="40" height="24" rx="12" fill="#374151" />
          {/* D-Pad */}
          <path d="M22 28 H26 V32 H22 Z M24 26 H24 V34 Z" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" />
          {/* Action buttons */}
          <circle cx="42" cy="29" r="2.5" fill="#EF4444" />
          <circle cx="45" cy="32" r="2.5" fill="#10B981" />
          <circle cx="39" cy="32" r="2.5" fill="#3B82F6" />
          <circle cx="42" cy="35" r="2.5" fill="#FBBF24" />
          {/* Joy Sticks */}
          <circle cx="30" cy="36" r="4" fill="#1F2937" />
          <circle cx="34" cy="36" r="4" fill="#1F2937" />
        </svg>
      );
    case 'chair':
      return (
        <svg className="w-8 h-8 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
          <path d="M16 20 H48 V38 H16 Z" fill="#EC4899" />
          {/* Seat Cushion */}
          <path d="M12 38 H52 V44 H12 Z" fill="#DB2777" />
          {/* Legs */}
          <line x1="16" y1="44" x2="12" y2="56" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          <line x1="48" y1="44" x2="52" y2="56" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'fridge':
      return (
        <svg className="w-8 h-8 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
          <rect x="18" y="10" width="28" height="44" rx="4" fill="#D1D5DB" />
          <line x1="18" y1="28" x2="46" y2="28" stroke="#9CA3AF" strokeWidth="2" />
          {/* Handles */}
          <rect x="42" y="18" width="2" height="6" rx="1" fill="#374151" />
          <rect x="42" y="32" width="2" height="10" rx="1" fill="#374151" />
          {/* Screen */}
          <rect x="24" y="16" width="8" height="6" rx="1" fill="#60A5FA" />
        </svg>
      );
    case 'drone':
      return (
        <svg className="w-8 h-8 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="8" fill="#1F2937" />
          <line x1="18" y1="18" x2="46" y2="46" stroke="#374151" strokeWidth="4.5" />
          <line x1="18" y1="46" x2="46" y2="18" stroke="#374151" strokeWidth="4.5" />
          {/* Rotors */}
          <circle cx="18" cy="18" r="4" fill="#E5E7EB" stroke="#111827" strokeWidth="1.5" />
          <circle cx="46" cy="18" r="4" fill="#E5E7EB" stroke="#111827" strokeWidth="1.5" />
          <circle cx="18" cy="46" r="4" fill="#E5E7EB" stroke="#111827" strokeWidth="1.5" />
          <circle cx="46" cy="46" r="4" fill="#E5E7EB" stroke="#111827" strokeWidth="1.5" />
          {/* Red camera eye */}
          <circle cx="32" cy="32" r="2" fill="#EF4444" />
        </svg>
      );
    case 'mic':
      return (
        <svg className="w-8 h-8 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
          <rect x="29" y="26" width="6" height="24" rx="3" fill="#4B5563" />
          <rect x="26" y="14" width="12" height="16" rx="6" fill="#D1D5DB" />
          <circle cx="32" cy="22" r="6" stroke="#9CA3AF" strokeWidth="1" fill="none" />
          {/* Ring */}
          <path d="M22 24 C22 32, 42 32, 42 24" stroke="#374151" strokeWidth="3" fill="none" />
        </svg>
      );
    case 'tent':
      return (
        <svg className="w-8 h-8 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
          <polygon points="32,14 10,48 54,48" fill="#10B981" />
          <polygon points="32,14 32,48 54,48" fill="#059669" />
          {/* Entrance */}
          <polygon points="32,28 20,48 44,48" fill="#064E3B" />
          {/* Fire */}
          <circle cx="32" cy="52" r="2" fill="#F59E0B" />
        </svg>
      );
    case 'speaker':
      return (
        <svg className="w-8 h-8 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
          <rect x="18" y="10" width="28" height="44" rx="4" fill="#111827" />
          <circle cx="32" cy="20" r="4" fill="#374151" />
          <circle cx="32" cy="38" r="10" fill="#374151" />
          <circle cx="32" cy="38" r="6" fill="#9CA3AF" />
        </svg>
      );
    case 'hammer':
      return (
        <svg className="w-8 h-8 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
          <rect x="30" y="24" width="4" height="28" rx="2" fill="#78350F" />
          {/* Sledge head */}
          <rect x="22" y="14" width="20" height="10" rx="2" fill="#4B5563" fillOpacity="0.9" />
          <path d="M20 16 L24 22 H40 L44 16 Z" fill="#9CA3AF" />
        </svg>
      );
    case 'tripod':
      return (
        <svg className="w-8 h-8 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
          {/* Ring Light */}
          <circle cx="32" cy="18" r="8" stroke="#FBBF24" strokeWidth="4" fill="none" />
          <line x1="32" y1="26" x2="32" y2="40" stroke="#374151" strokeWidth="3" />
          {/* Tripod Legs */}
          <line x1="32" y1="40" x2="20" y2="56" stroke="#374151" strokeWidth="3" strokeLinecap="round" />
          <line x1="32" y1="40" x2="44" y2="56" stroke="#374151" strokeWidth="3" strokeLinecap="round" />
          <line x1="32" y1="40" x2="32" y2="54" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'bear':
      return (
        <svg className="w-8 h-8 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="34" r="14" fill="#B45309" />
          <circle cx="32" cy="18" r="9" fill="#B45309" />
          {/* Ears */}
          <circle cx="23" cy="11" r="4" fill="#B45309" />
          <circle cx="41" cy="11" r="4" fill="#B45309" />
          <circle cx="23" cy="11" r="2" fill="#FCA5A5" />
          <circle cx="41" cy="11" r="2" fill="#FCA5A5" />
          {/* Snout */}
          <ellipse cx="32" cy="20" rx="4" ry="2.5" fill="#FDE047" />
          <circle cx="32" cy="19" r="1.2" fill="#111827" />
        </svg>
      );
    case 'paw':
      return (
        <svg className="w-8 h-8 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
          <ellipse cx="32" cy="38" rx="11" ry="9" fill="#8B5CF6" />
          {/* Toes */}
          <circle cx="18" cy="26" r="3.5" fill="#8B5CF6" />
          <circle cx="27" cy="20" r="4.2" fill="#8B5CF6" />
          <circle cx="37" cy="20" r="4.2" fill="#8B5CF6" />
          <circle cx="46" cy="26" r="3.5" fill="#8B5CF6" />
        </svg>
      );
    case 'suitcase':
      return (
        <svg className="w-8 h-8 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
          <rect x="20" y="20" width="24" height="32" rx="4" fill="#06B6D4" />
          {/* Handle */}
          <path d="M28 20 V12 H36 V20" stroke="#4B5563" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          {/* Wheels */}
          <circle cx="24" cy="53" r="3" fill="#111827" />
          <circle cx="40" cy="53" r="3" fill="#111827" />
          {/* Sticker */}
          <rect x="24" y="28" width="6" height="4" rx="1" fill="#F59E0B" transform="rotate(10, 24, 28)" />
        </svg>
      );
    case 'bicycle':
      return (
        <svg className="w-8 h-8 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="frameGradDrawer" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0891B2" />
            </linearGradient>
          </defs>
          {/* Shadow */}
          <ellipse cx="18" cy="50" rx="10" ry="2.5" fill="#000000" fillOpacity="0.2" />
          <ellipse cx="46" cy="50" rx="10" ry="2.5" fill="#000000" fillOpacity="0.2" />

          {/* Bike Wheels */}
          <circle cx="18" cy="44" r="10" stroke="#1F2937" strokeWidth="3.5" fill="none" />
          <circle cx="18" cy="44" r="2" fill="#9CA3AF" />
          
          <circle cx="46" cy="44" r="10" stroke="#1F2937" strokeWidth="3.5" fill="none" />
          <circle cx="46" cy="44" r="2" fill="#9CA3AF" />

          {/* Bike Frame */}
          <path d="M18 44 L30 30 L44 30 L46 44 Z" stroke="url(#frameGradDrawer)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M30 44 L30 30 M30 30 L38 20" stroke="url(#frameGradDrawer)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* Handlebars */}
          <path d="M38 20 H44 C45 20 46 19 46 18" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Seat */}
          <path d="M26 23 H32" stroke="#1F2937" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="29" y1="23" x2="30" y2="30" stroke="#1F2937" strokeWidth="2" />
        </svg>
      );
    case 'kit':
      return (
        <svg className="w-8 h-8 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
          <rect x="16" y="18" width="32" height="28" rx="5" fill="#EF4444" />
          {/* Handle */}
          <path d="M26 18 V12 H38 V18" stroke="#991B1B" strokeWidth="3" fill="none" />
          {/* White Cross */}
          <rect x="30" y="26" width="4" height="12" rx="1" fill="#FFFFFF" />
          <rect x="26" y="30" width="12" height="4" rx="1" fill="#FFFFFF" />
        </svg>
      );
    case 'crane':
      return (
        <svg className="w-8 h-8 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
          {/* Base */}
          <rect x="12" y="48" width="24" height="8" rx="2" fill="#FBBF24" />
          <circle cx="18" cy="54" r="3.5" fill="#111827" />
          <circle cx="30" cy="54" r="3.5" fill="#111827" />
          {/* Crane Arm */}
          <line x1="24" y1="48" x2="38" y2="20" stroke="#FBBF24" strokeWidth="4" />
          <line x1="38" y1="20" x2="52" y2="20" stroke="#FBBF24" strokeWidth="4" />
          {/* Hook */}
          <line x1="52" y1="20" x2="52" y2="34" stroke="#4B5563" strokeWidth="2.5" />
          <path d="M50 34 C50 36, 54 36, 54 34" stroke="#111827" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      );
    default:
      return null;
  }
};

export default function CategoryNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [activeCategory, setActiveCategory] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scrollContainerRef = useRef(null);

  // Sync state with URL params
  useEffect(() => {
    const category = searchParams.get('category') || '';
    setActiveCategory(category.toLowerCase());
  }, [searchParams]);

  // Handle scrolling visibility arrows
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      // Show left arrow if we have scrolled to the right
      setShowLeftArrow(scrollLeft > 5);
      // Show right arrow if we can scroll more
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      // Initial check
      checkScroll();
      // Handle resize recalculations
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  // Lock body scroll on mobile when drawer is expanded
  useEffect(() => {
    const handleScrollLock = () => {
      if (isExpanded && window.innerWidth < 640) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    };

    handleScrollLock();
    
    // Add resize listener to dynamically unlock if user resizes to desktop
    window.addEventListener('resize', handleScrollLock);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('resize', handleScrollLock);
    };
  }, [isExpanded]);

  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmt = direction === 'left' ? -260 : 260;
      container.scrollBy({ left: scrollAmt, behavior: 'smooth' });
    }
  };

  // Toggle Category selection
  const handleSelectCategory = (queryVal) => {
    const params = new URLSearchParams(searchParams.toString());
    const lowerQueryVal = queryVal.toLowerCase();

    if (activeCategory === lowerQueryVal) {
      // Clear filter if already selected
      params.delete('category');
    } else {
      params.set('category', queryVal);
    }

    // Retain page placement scroll settings but navigate to target section
    router.push(`${pathname}?${params.toString()}#items`, { scroll: false });
  };

  return (
    <div className="w-full mt-10 relative">
      
      {/* Horizontal Nav Bar */}
      <div className="relative group max-w-5xl mx-auto px-4">
        
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 md:-translate-x-3 bg-white hover:bg-gray-50 border border-gray-200/80 shadow-md hover:shadow-lg w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center z-20 text-gray-600 transition-all hover:scale-105 active:scale-95"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        )}

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1.5 md:translate-x-3 bg-white hover:bg-gray-50 border border-gray-200/80 shadow-md hover:shadow-lg w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center z-20 text-gray-600 transition-all hover:scale-105 active:scale-95"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        )}

        {/* Horizontal Card List Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center justify-center sm:justify-start gap-4 overflow-x-auto pb-4 pt-1 px-1 no-scrollbar snap-x snap-mandatory scroll-smooth"
        >
          {CORE_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.queryVal.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.queryVal)}
                className={`${cat.mobileVisible ? 'flex' : 'hidden sm:flex'} flex-col items-center flex-none snap-start w-28 md:w-32 py-4 px-2 rounded-2xl bg-white border text-center transition-all duration-300
                  ${isActive 
                    ? 'border-[#003B95] shadow-lg shadow-[#003B95]/5 ring-2 ring-[#003B95]/20 scale-[1.03] -translate-y-0.5' 
                    : 'border-gray-100/90 shadow-sm hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5'}`}
              >
                {/* 3D Icon wrapper */}
                <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center transition-transform duration-300 ${cat.bgColor} ${isActive ? 'scale-105 ring-2 ring-offset-2 ring-blue-500/20' : 'group-hover:scale-110'}`}>
                  {cat.icon}
                </div>
                
                {/* Label */}
                <span className={`block mt-3 text-xs md:text-sm font-semibold transition-colors duration-200
                  ${isActive ? 'text-[#003B95] font-bold' : 'text-gray-600'}`}>
                  {cat.label}
                </span>
              </button>
            );
          })}

          {/* More Category Grid Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex-none snap-start w-28 md:w-32 py-4 px-2 rounded-2xl bg-white border text-center transition-all duration-300
              ${isExpanded 
                ? 'border-indigo-600 shadow-lg shadow-indigo-600/5 ring-2 ring-indigo-600/20 scale-[1.03] -translate-y-0.5' 
                : 'border-gray-100/90 shadow-sm hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5'}`}
          >
            {/* 3D Icon Wrapper */}
            <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center transition-transform duration-300 bg-indigo-50/50 hover:bg-indigo-100/50 ${isExpanded ? 'scale-105' : ''}`}>
              <MoreIcon />
            </div>
            
            {/* Label */}
            <span className={`block mt-3 text-xs md:text-sm font-semibold transition-colors duration-200
              ${isExpanded ? 'text-indigo-600 font-bold' : 'text-gray-600'}`}>
              More
            </span>
          </button>
        </div>
      </div>

      {/* Expanded Animated Categories Drawer Panel */}
      <div 
        className={`hidden sm:block overflow-hidden transition-all duration-500 ease-in-out border-gray-100 bg-white
          ${isExpanded 
            ? 'max-h-[1200px] opacity-100 mt-6 border-t shadow-2xl shadow-gray-200/50 rounded-b-[2rem]' 
            : 'max-h-0 opacity-0 pointer-events-none'}`}
      >
        <div className="max-w-5xl mx-auto px-6 py-6">
          
          {/* Close Button Row */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Grid Display */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {PANEL_CATEGORIES.map((cat, index) => {
              const isActive = activeCategory === cat.queryVal.toLowerCase();
              return (
                <button
                  key={index}
                  onClick={() => {
                    handleSelectCategory(cat.queryVal);
                    setIsExpanded(false);
                  }}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl text-left border transition-all duration-200 group
                    ${isActive
                      ? 'border-[#003B95] bg-[#003B95]/5 shadow-md shadow-[#003B95]/5'
                      : 'border-gray-50 hover:border-gray-200 hover:shadow-md bg-gray-50/40 hover:bg-white hover:-translate-y-0.5'}`}
                >
                  {/* SVG Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 bg-white shadow-sm group-hover:scale-105
                    ${isActive ? 'ring-2 ring-[#003B95]/20' : 'border border-gray-100'}`}>
                    <DrawerIcon type={cat.iconName} />
                  </div>

                  {/* Text Label */}
                  <div className="min-w-0">
                    <span className={`block text-xs md:text-sm font-bold truncate leading-snug transition-colors
                      ${isActive ? 'text-[#003B95]' : 'text-gray-800'}`}>
                      {cat.label}
                    </span>
                    <span className="block text-[10px] text-gray-400 font-medium leading-none mt-0.5">Rent now</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Popup Modal for All Categories */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsExpanded(false)}
          />
          {/* Modal Content */}
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl flex flex-col max-h-[80vh] z-10 overflow-hidden border border-gray-100 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-black text-gray-900">All Categories</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close categories"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-5 space-y-6 flex-grow no-scrollbar">
              {/* Section: Core Categories */}
              <div>
                <h4 className="text-xs font-black text-gray-400 tracking-wider uppercase mb-3">Core Categories</h4>
                <div className="grid grid-cols-2 gap-3">
                  {CORE_CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.queryVal.toLowerCase();
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          handleSelectCategory(cat.queryVal);
                          setIsExpanded(false);
                        }}
                        className={`flex items-center gap-2.5 p-3 rounded-2xl text-left border transition-all duration-200 group
                          ${isActive
                            ? 'border-[#003B95] bg-[#003B95]/5 shadow-sm'
                            : 'border-gray-100 bg-gray-50/50 hover:bg-white'}`}
                      >
                        {/* SVG Icon */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 bg-white shadow-sm group-hover:scale-105
                          ${isActive ? 'ring-2 ring-[#003B95]/20' : 'border border-gray-100'}`}>
                          <div className="scale-75 flex items-center justify-center">
                            {cat.icon}
                          </div>
                        </div>
                        <span className={`text-xs font-bold truncate ${isActive ? 'text-[#003B95]' : 'text-gray-700'}`}>
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section: More Categories */}
              <div>
                <h4 className="text-xs font-black text-gray-400 tracking-wider uppercase mb-3">More Categories</h4>
                <div className="grid grid-cols-2 gap-3">
                  {PANEL_CATEGORIES.map((cat, index) => {
                    const isActive = activeCategory === cat.queryVal.toLowerCase();
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          handleSelectCategory(cat.queryVal);
                          setIsExpanded(false);
                        }}
                        className={`flex items-center gap-2.5 p-3 rounded-2xl text-left border transition-all duration-200 group
                          ${isActive
                            ? 'border-[#003B95] bg-[#003B95]/5 shadow-sm'
                            : 'border-gray-100 bg-gray-50/50 hover:bg-white'}`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 bg-white shadow-sm group-hover:scale-105
                          ${isActive ? 'ring-2 ring-[#003B95]/20' : 'border border-gray-100'}`}>
                          <DrawerIcon type={cat.iconName} />
                        </div>
                        <span className={`text-xs font-bold truncate ${isActive ? 'text-[#003B95]' : 'text-gray-800'}`}>
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
