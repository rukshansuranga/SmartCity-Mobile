import {
  AssetStatus,
  AssetType,
  ComplaintTemplate,
} from "@/types/infrastructure";

// Asset icon configuration
export const ASSET_ICON_CONFIG: Record<
  AssetType,
  { family: string; name: string }
> = {
  [AssetType.Library]: { family: "MaterialCommunityIcons", name: "library" },
  [AssetType.Streetlight]: {
    family: "MaterialCommunityIcons",
    name: "lightbulb-on",
  },
  [AssetType.Playground]: {
    family: "MaterialCommunityIcons",
    name: "human-child",
  },
  [AssetType.BusStop]: { family: "MaterialCommunityIcons", name: "bus-stop" },
  [AssetType.Park]: { family: "MaterialCommunityIcons", name: "pine-tree" },
  [AssetType.Bin]: { family: "MaterialCommunityIcons", name: "delete" },
};

// Asset icons (emojis) - kept for backward compatibility
export const ASSET_ICONS: Record<AssetType, string> = {
  [AssetType.Library]: "🏛️",
  [AssetType.Streetlight]: "🔆",
  [AssetType.Playground]: "🛝",
  [AssetType.BusStop]: "🚏",
  [AssetType.Park]: "🏞️",
  [AssetType.Bin]: "🗑️",
};

// Asset specific colors with green palette accents
export const ASSET_COLORS: Record<AssetType, string> = {
  [AssetType.Library]: "#3B82F6", // Blue
  [AssetType.Streetlight]: "#EAB308", // Yellow
  [AssetType.Playground]: "#22C55E", // Green
  [AssetType.Bin]: "#EF4444", // Red
  [AssetType.BusStop]: "#8B5CF6", // Purple
  [AssetType.Park]: "#10B981", // Emerald
};

// Asset status colors
export const STATUS_COLORS: Record<AssetStatus, string> = {
  [AssetStatus.Active]: "#22C55E", // Green
  [AssetStatus.Inactive]: "#6B7280", // Gray
  [AssetStatus.UnderMaintenance]: "#EAB308", // Yellow
  [AssetStatus.Decommissioned]: "#EF4444", // Red
};

// Complaint templates for each asset type
export const COMPLAINT_TEMPLATES: Record<AssetType, ComplaintTemplate[]> = {
  [AssetType.Library]: [
    {
      id: "library_facility",
      label: "Facility not working",
      icon: "🔧",
      subject: "Facility not working",
    },
    {
      id: "library_clean",
      label: "Cleanliness issue",
      icon: "🧹",
      subject: "Cleanliness issue",
    },
    {
      id: "library_hours",
      label: "Opening hours issue",
      icon: "🕐",
      subject: "Opening hours issue",
    },
    {
      id: "library_wifi",
      label: "WiFi not working",
      icon: "📶",
      subject: "WiFi not working",
    },
    {
      id: "library_staff",
      label: "Staff assistance needed",
      icon: "👤",
      subject: "Staff assistance needed",
    },
    {
      id: "library_other",
      label: "Other (describe below)",
      icon: "📋",
      subject: "",
    },
  ],
  [AssetType.Playground]: [
    {
      id: "ground_closed",
      label: "Ground closed unexpectedly",
      icon: "🚫",
      subject: "Ground closed unexpectedly",
    },
    {
      id: "ground_bathrooms",
      label: "Bathrooms not cleaned",
      icon: "🚽",
      subject: "Bathrooms not cleaned",
    },
    {
      id: "ground_track",
      label: "Track/surface damaged",
      icon: "⚠️",
      subject: "Track/surface damaged",
    },
    {
      id: "ground_equipment",
      label: "Equipment broken",
      icon: "🔧",
      subject: "Equipment broken",
    },
    {
      id: "ground_lighting",
      label: "Lighting not working",
      icon: "💡",
      subject: "Lighting not working",
    },
    {
      id: "ground_safety",
      label: "Safety concern",
      icon: "🛡️",
      subject: "Safety concern",
    },
    {
      id: "ground_other",
      label: "Other (describe below)",
      icon: "📋",
      subject: "",
    },
  ],
  [AssetType.Streetlight]: [
    {
      id: "light_not_working",
      label: "Light not working",
      icon: "💡",
      subject: "Light not working",
    },
    {
      id: "light_pole_broken",
      label: "Pole broken/damaged",
      icon: "🔧",
      subject: "Pole broken/damaged",
    },
    {
      id: "light_flickering",
      label: "Flickering light",
      icon: "⚡",
      subject: "Flickering light",
    },
    {
      id: "light_day_on",
      label: "Light on during day",
      icon: "☀️",
      subject: "Light on during day",
    },
    {
      id: "light_electrical",
      label: "Electrical hazard",
      icon: "⚠️",
      subject: "Electrical hazard",
    },
    {
      id: "light_other",
      label: "Other (describe below)",
      icon: "📋",
      subject: "",
    },
  ],
  [AssetType.BusStop]: [
    {
      id: "bus_shelter",
      label: "Shelter damaged",
      icon: "🏠",
      subject: "Shelter damaged",
    },
    {
      id: "bus_bench",
      label: "Bench broken",
      icon: "🪑",
      subject: "Bench broken",
    },
    {
      id: "bus_unsafe",
      label: "Unsafe conditions",
      icon: "⚠️",
      subject: "Unsafe conditions",
    },
    {
      id: "bus_timetable",
      label: "Timetable outdated",
      icon: "📅",
      subject: "Timetable outdated",
    },
    {
      id: "bus_clean",
      label: "Cleanliness issue",
      icon: "🧹",
      subject: "Cleanliness issue",
    },
    {
      id: "bus_other",
      label: "Other (describe below)",
      icon: "📋",
      subject: "",
    },
  ],
  [AssetType.Park]: [
    {
      id: "park_locked",
      label: "Gate/entrance locked",
      icon: "🔒",
      subject: "Gate/entrance locked",
    },
    {
      id: "park_facilities",
      label: "Facilities broken",
      icon: "🔧",
      subject: "Facilities broken",
    },
    {
      id: "park_clean",
      label: "Cleanliness issue",
      icon: "🧹",
      subject: "Cleanliness issue",
    },
    {
      id: "park_safety",
      label: "Safety concern",
      icon: "🛡️",
      subject: "Safety concern",
    },
    {
      id: "park_lighting",
      label: "Lighting not working",
      icon: "💡",
      subject: "Lighting not working",
    },
    {
      id: "park_other",
      label: "Other (describe below)",
      icon: "📋",
      subject: "",
    },
  ],
  [AssetType.Bin]: [
    {
      id: "bin_overflowing",
      label: "Bin overflowing",
      icon: "🗑️",
      subject: "Bin overflowing",
    },
    {
      id: "bin_damaged",
      label: "Bin damaged",
      icon: "🔧",
      subject: "Bin damaged",
    },
    {
      id: "bin_not_emptied",
      label: "Not emptied on schedule",
      icon: "📅",
      subject: "Not emptied on schedule",
    },
    {
      id: "bin_wrong_waste",
      label: "Wrong waste type",
      icon: "⚠️",
      subject: "Wrong waste type in bin",
    },
    {
      id: "bin_missing",
      label: "Missing bin",
      icon: "❌",
      subject: "Bin missing from location",
    },
    {
      id: "bin_other",
      label: "Other (describe below)",
      icon: "📋",
      subject: "",
    },
  ],
};

// Asset type display names
export const ASSET_TYPE_NAMES: Record<AssetType, string> = {
  [AssetType.Library]: "Library",
  [AssetType.Streetlight]: "Streetlight",
  [AssetType.Playground]: "Playground",
  [AssetType.Bin]: "Bin",
  [AssetType.BusStop]: "Bus Stop",
  [AssetType.Park]: "Park",
};

// Asset type plural names
export const ASSET_TYPE_PLURAL_NAMES: Record<AssetType, string> = {
  [AssetType.Library]: "Libraries",
  [AssetType.Streetlight]: "Streetlights",
  [AssetType.Playground]: "Playgrounds",
  [AssetType.Bin]: "Bins",
  [AssetType.BusStop]: "Bus Stops",
  [AssetType.Park]: "Parks",
};
