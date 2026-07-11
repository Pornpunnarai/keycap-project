/**
 * Filament master data — edit this list to match stock on hand.
 * Users can only pick colors defined here (id, name, hex).
 */
import type { Filament } from "@/lib/types"

export const FILAMENTS: Filament[] = [
  { id: "pla-white", name: "สีขาว", hex: "#FFFFFF" },
  { id: "pla-red", name: "สีแดง", hex: "#6D0404" },
  { id: "pla-light-pink", name: "สีชมพูอ่อน", hex: "#edbed5" },
  { id: "pla-dark-pink", name: "สีชมพูเข้ม", hex: "#FA5380" },
  { id: "pla-light-yellow", name: "สีเหลืองอ่อน", hex: "#ffea00" },
  { id: "pla-dark-yellow", name: "สีเหลืองเข้ม", hex: "#f2ae00" },
  { id: "pla-green", name: "สีเขียวขี้ม้า", hex: "#274332" },
  { id: "pla-blue", name: "สีฟ้า", hex: "#02a8d6" },
  { id: "pla-dark-blue", name: "สีน้ำเงิน", hex: "#3504c9" },
  { id: "pla-light-purple", name: "ม่วงอ่อน", hex: "#c6acfa" },
  { id: "pla-dark-purple", name: "ม่วงเข้ม", hex: "#4e2a6b" },
  { id: "pla-cream", name: "สีครีม", hex: "#fce3a9" },
  { id: "pla-latte", name: "สีลาเต้", hex: "#c7ab7b" },
  { id: "pla-brown", name: "สีตาล", hex: "#5c2501" },
  { id: "pla-gray", name: "สีเทา", hex: "#8d97a1" },
  { id: "pla-black", name: "สีดำ", hex: "#1A1A1A" },
]
