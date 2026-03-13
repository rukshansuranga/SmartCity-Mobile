# Infrastructure & Complaint System - Mobile Implementation Instructions

> **Purpose**: This document provides complete instructions for implementing the infrastructure asset management and complaint system in an Expo React Native mobile app.
>
> **Source**: Based on Next.js web application at `d:\SmartCiy\SmartCityFrontend`  
> **Backend API**: Already implemented and deployed  
> **Target**: Expo React Native mobile app

---

## 🎯 WHAT TO BUILD

### Feature Overview

Build a mobile infrastructure management system that allows citizens to:

1. **View infrastructure assets** on an interactive map (libraries, streetlights, playgrounds, bus stops, parks, bins)
2. **Search and filter assets** by type, name, code, and status
3. **View detailed asset information** including specifications and complaint history
4. **Submit complaints** against specific assets using predefined templates or free-form
5. **Attach evidence** (photos, videos, voice recordings) to complaints
6. **Work offline** with automatic sync when connection is restored

### Navigation Structure

```
App Navigation
├── Complains Tab
│   └── Complaint Categories Screen (Grid)
│       ├── General (existing)
│       ├── Project (existing)
│       ├── Library → Map (filtered) → Complaint Form
│       ├── Playground → Map (filtered) → Complaint Form
│       ├── Streetlight → Map (filtered) → Complaint Form
│       ├── Bus Stop → Map (filtered) → Complaint Form
│       ├── Park → Map (filtered) → Complaint Form
│       └── Bin → Map (filtered) → Complaint Form
│
└── Infrastructure Tab
    └── Infrastructure Categories Screen (Grid)
        └── [Same asset types] → Map (filtered) → Asset Detail → Complaint Form
```

---

## 📋 IMPLEMENTATION REQUIREMENTS

### 1. Asset Types (6 Total)

| Asset Type      | Geometry      | Icon | Primary Use Case           |
| --------------- | ------------- | ---- | -------------------------- |
| **Library**     | Point         | 📚   | Community facilities       |
| **Streetlight** | Point         | 💡   | Street lighting            |
| **Playground**  | Polygon/Point | 🎮   | Sports grounds, play areas |
| **Bus Stop**    | Point         | 🚌   | Public transport           |
| **Park**        | Polygon       | 🌳   | Parks and green spaces     |
| **Bin**         | Point         | 🗑️   | Waste management           |

### 2. Complaint Templates (Hybrid Approach)

**Each asset type has 5-7 predefined complaint options + "Other":**

#### Library (6 options)

- 🔧 Facility not working
- 🧹 Cleanliness issue
- 🕐 Opening hours issue
- 📶 WiFi not working
- 👤 Staff assistance needed
- 📋 Other (describe below)

#### Playground/Ground (7 options)

- 🚫 Ground closed unexpectedly
- 🚽 Bathrooms not cleaned
- ⚠️ Track/surface damaged
- 🔧 Equipment broken
- 💡 Lighting not working
- 🛡️ Safety concern
- 📋 Other (describe below)

#### Streetlight (6 options)

- 💡 Light not working
- 🔧 Pole broken/damaged
- ⚡ Flickering light
- ☀️ Light on during day
- ⚠️ Electrical hazard
- 📋 Other (describe below)

#### Bus Stop (6 options)

- 🏠 Shelter damaged
- 🪑 Bench broken
- ⚠️ Unsafe conditions
- 📅 Timetable outdated
- 🧹 Cleanliness issue
- 📋 Other (describe below)

#### Park (6 options)

- 🔒 Gate/entrance locked
- 🔧 Facilities broken
- 🧹 Cleanliness issue
- 🛡️ Safety concern
- 💡 Lighting not working
- 📋 Other (describe below)

#### Bin (6 options)

- 🗑️ Bin overflowing
- 🔧 Bin damaged
- 📅 Not emptied on schedule
- ⚠️ Wrong waste type
- ❌ Missing bin
- 📋 Other (describe below)

**Form Behavior:**

- When predefined option selected: Subject auto-fills, description optional
- When "Other" selected: Subject and description both required
- Attachments always optional

### 3. Core Screens (6 Total)

#### Screen 1: Complaint Categories (Grid Layout)

- **Purpose**: Entry point for complaint submission
- **Design**: 2-column grid on phone, 3-4 on tablet
- **Content**: General, Project, Library, Playground, Streetlight, Bus Stop, Park, Bin
- **Action**: Tap tile → Navigate to Infrastructure Map (filtered)

#### Screen 2: Infrastructure Categories (Grid Layout)

- **Purpose**: Entry point for viewing infrastructure
- **Design**: 2-column grid on phone, 3-4 on tablet
- **Content**: Library, Playground, Streetlight, Bus Stop, Park, Bin (no General/Project)
- **Action**: Tap tile → Navigate to Infrastructure Map (filtered)

#### Screen 3: Infrastructure Map

- **Purpose**: View and select assets on interactive map
- **Components**:
  - Map with markers (points) and polygons (areas)
  - Search bar (search by name/code)
  - Filter button (status: Active, Inactive, Under Maintenance)
  - Asset count badge
  - User location button
- **Data Loading**: Bounds-based (load assets in current viewport)
- **Interactions**:
  - Tap marker → Show bottom sheet with asset preview
  - Tap preview "Report Issue" → Navigate to Complaint Form
  - Tap preview "View Details" → Navigate to Asset Detail

#### Screen 4: Asset Detail

- **Purpose**: Show comprehensive asset information
- **Sections**:
  - Header: Name, code, status badge
  - Map preview (small)
  - Asset information (type-specific fields)
  - Complaint history (recent 5)
  - "Report Issue" button
- **Type-Specific Fields**: See data models section below

#### Screen 5: Asset Complaint Form

- **Purpose**: Submit complaint for specific asset
- **Components**:
  - Asset header (name, type, icon)
  - Template selector (predefined buttons)
  - Subject field (auto-filled or manual)
  - Description field (optional or required)
  - Attachment buttons (Photo, Video, Voice)
  - Attachment previews
  - Submit button
- **Validation**:
  - Must select template or fill "Other"
  - "Other" requires subject + description
  - Attachments optional

#### Screen 6: Complaint History

- **Purpose**: View all complaints for an asset
- **Components**:
  - Filter chips (All, New, In Progress, Resolved, Closed)
  - Sort dropdown (Newest, Oldest, Status)
  - Complaint list (infinite scroll)
- **Action**: Tap complaint → Complaint Detail screen

---

## 🔧 TECHNICAL IMPLEMENTATION

### Prerequisites & Dependencies

```bash
# Core dependencies
npm install axios react-native-maps
npm install @react-native-async-storage/async-storage
npm install @react-native-community/netinfo
npm install react-navigation

# Attachment handling
npm install expo-image-picker expo-av expo-camera expo-file-system

# UI components
npm install react-native-vector-icons
npm install react-native-toast-message

# State management
npm install zustand

# Forms
npm install react-hook-form zod
```

### Environment Configuration

```bash
# .env file
EXPO_PUBLIC_API_URL=https://api.mahara.gov.lk
EXPO_PUBLIC_COUNCIL_ID=mahara
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

---

## 📦 DATA MODELS

### Enums

```typescript
// types/enums.ts

export enum AssetType {
  Library = "Library",
  Streetlight = "Streetlight",
  Playground = "Playground",
  Bin = "Bin",
  BusStop = "BusStop",
  Park = "Park",
}

export enum AssetStatus {
  Active = 0,
  Inactive = 1,
  UnderMaintenance = 2,
  Decommissioned = 3,
}

export enum ComplaintStatus {
  New = 0,
  InProgress = 1,
  Resolved = 2,
  Closed = 3,
  Assigned = 4,
}

export enum BulbType {
  LED = 0,
  Halogen = 1,
  Sodium = 2,
  Fluorescent = 3,
}

export enum PoleCondition {
  Good = 0,
  Fair = 1,
  Poor = 2,
  Critical = 3,
}

export enum BinType {
  General = 0,
  Recycling = 1,
  Organic = 2,
  Hazardous = 3,
}

export enum EntranceType {
  Free = 0,
  Reservation = 1,
  Paid = 2,
}
```

### Base Infrastructure Asset

```typescript
// types/infrastructure.ts

export interface InfrastructureAssetBase {
  assetId: string;
  councilId: string;
  assetType: AssetType;
  assetName: string;
  assetCode?: string;
  geometryType: "Point" | "Polygon" | "LineString";
  status: AssetStatus;
  note?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface PointLocation {
  latitude: number;
  longitude: number;
}

export interface PolygonLocation {
  coordinates: { lat: number; lng: number }[];
}
```

### Specific Asset Types

```typescript
export interface Library extends InfrastructureAssetBase {
  assetType: AssetType.Library;
  geometryType: "Point";
  location: PointLocation;
  openDays?: string;
  openingHours?: string;
  facilities?: string;
  hasWifi: boolean;
  phone?: string;
  email?: string;
  mobile?: string;
}

export interface Streetlight extends InfrastructureAssetBase {
  assetType: AssetType.Streetlight;
  geometryType: "Point";
  location: PointLocation;
  bulbType: BulbType;
  wattage: number;
  lastMaintenanceDate?: string;
  poleCondition: PoleCondition;
  height_Meters: number;
  solar: boolean;
}

export interface Playground extends InfrastructureAssetBase {
  assetType: AssetType.Playground;
  geometryType: "Polygon" | "Point";
  location: PolygonLocation | PointLocation;
  facilities?: string;
  area_SqMeters: number;
  hasShade: boolean;
  phone?: string;
  entrance: EntranceType;
}

export interface Bin extends InfrastructureAssetBase {
  assetType: AssetType.Bin;
  geometryType: "Point";
  location: PointLocation;
  capacity_Liters: number;
  binType: BinType;
  collectionDay?: string;
  lastEmptied?: string;
}

export interface BusStop extends InfrastructureAssetBase {
  assetType: AssetType.BusStop;
  geometryType: "Point";
  location: PointLocation;
  routesServed?: string;
  hasShelter: boolean;
  hasBench: boolean;
  timetable?: string;
}

export interface Park extends InfrastructureAssetBase {
  assetType: AssetType.Park;
  geometryType: "Polygon";
  location: PolygonLocation;
  facilities?: string;
  area_SqMeters: number;
  hasPlayground: boolean;
  hasParking: boolean;
  entrance: EntranceType;
  openingHours?: string;
}

export type InfrastructureAsset =
  | Library
  | Streetlight
  | Playground
  | Bin
  | BusStop
  | Park;

export interface AssetCounts {
  [AssetType.Library]: number;
  [AssetType.Streetlight]: number;
  [AssetType.Playground]: number;
  [AssetType.Bin]: number;
  [AssetType.BusStop]: number;
  [AssetType.Park]: number;
}
```

### Complaint Models

```typescript
// types/complaint.ts

export interface InfrastructureComplaint {
  complainId: number;
  subject: string;
  detail: string;
  status: ComplaintStatus;
  assetId: string;
  infrastructureType: number; // 0-5 mapping to AssetType
  rating?: number;
  ratedBy?: string;
  ratingReview?: string;
  sentiment?: string;
  summary?: string;
  attachments?: ComplaintAttachment[];
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface CreateComplaintDto {
  subject: string;
  detail: string;
  status: number;
  assetId: string;
  infrastructureType: number;
}

export interface ComplaintAttachment {
  id: string;
  type: "photo" | "video" | "voice";
  uri: string;
  filename: string;
  size: number;
  mimeType: string;
}
```

### Complaint Templates

```typescript
// config/complaintTemplates.ts

export interface ComplaintTemplate {
  id: string;
  label: string;
  icon: string;
  subject: string;
  promptForDetails?: string;
}

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

// Helper to get infrastructure type number from AssetType
export const getInfrastructureTypeValue = (assetType: AssetType): number => {
  const mapping: Record<AssetType, number> = {
    [AssetType.Library]: 0,
    [AssetType.Streetlight]: 1,
    [AssetType.Playground]: 2,
    [AssetType.Bin]: 3,
    [AssetType.BusStop]: 4,
    [AssetType.Park]: 5,
  };
  return mapping[assetType];
};
```

---

## 🌐 API INTEGRATION

### API Client Setup

```typescript
// services/apiClient.ts

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://api.mahara.gov.lk";
const COUNCIL_ID = process.env.EXPO_PUBLIC_COUNCIL_ID || "mahara";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  error?: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        "X-Council-Id": COUNCIL_ID,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          throw new Error("No internet connection");
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem("access_token");
          await AsyncStorage.removeItem("refresh_token");
          // Navigate to login
        }
        return Promise.reject(error);
      },
    );
  }

  async get<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(
        url,
        data,
        config,
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async postFormData<T>(
    url: string,
    formData: FormData,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse {
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || "Server error",
        errors: error.response.data?.errors || [error.message],
      };
    } else if (error.request) {
      return {
        success: false,
        message: "No response from server",
        errors: ["Network error - please check your connection"],
      };
    } else {
      return {
        success: false,
        message: error.message || "Request failed",
        errors: [error.message],
      };
    }
  }
}

export const apiClient = new ApiClient();
```

### Infrastructure Service

```typescript
// services/infrastructureService.ts

import { apiClient, ApiResponse } from "./apiClient";
import { AssetType, AssetStatus } from "../types/enums";
import { InfrastructureAsset, AssetCounts } from "../types/infrastructure";

export const infrastructureService = {
  async getAssetsByBounds(
    bounds: { minLat: number; minLng: number; maxLat: number; maxLng: number },
    assetType?: AssetType,
  ): Promise<ApiResponse<InfrastructureAsset[]>> {
    const params = new URLSearchParams({
      minLat: bounds.minLat.toString(),
      minLng: bounds.minLng.toString(),
      maxLat: bounds.maxLat.toString(),
      maxLng: bounds.maxLng.toString(),
    });
    if (assetType) params.append("assetType", assetType);

    return apiClient.get<InfrastructureAsset[]>(
      `/api/Infrastructure/bounds?${params}`,
    );
  },

  async getAssetsByCouncil(
    assetType?: AssetType,
    status?: AssetStatus,
  ): Promise<ApiResponse<InfrastructureAsset[]>> {
    const params = new URLSearchParams();
    if (assetType) params.append("assetType", assetType);
    if (status !== undefined) params.append("status", status.toString());

    const url = params.toString()
      ? `/api/Infrastructure?${params}`
      : "/api/Infrastructure";
    return apiClient.get<InfrastructureAsset[]>(url);
  },

  async getAssetById(
    assetId: string,
  ): Promise<ApiResponse<InfrastructureAsset>> {
    return apiClient.get<InfrastructureAsset>(`/api/Infrastructure/${assetId}`);
  },

  async getAssetCounts(): Promise<ApiResponse<AssetCounts>> {
    return apiClient.get<AssetCounts>("/api/Infrastructure/counts");
  },
};
```

### Complaint Service

```typescript
// services/complaintService.ts

import { apiClient, ApiResponse } from "./apiClient";
import {
  InfrastructureComplaint,
  CreateComplaintDto,
} from "../types/complaint";

export const complaintService = {
  async createComplaint(
    data: CreateComplaintDto,
  ): Promise<ApiResponse<InfrastructureComplaint>> {
    return apiClient.post<InfrastructureComplaint>(
      "/api/Complain/infrastructure",
      data,
    );
  },

  async createComplaintWithAttachments(
    data: CreateComplaintDto,
    attachments: Array<{ uri: string; type: string; name: string }>,
  ): Promise<ApiResponse<InfrastructureComplaint>> {
    const formData = new FormData();
    formData.append("subject", data.subject);
    formData.append("detail", data.detail);
    formData.append("status", "0");
    formData.append("assetId", data.assetId);
    formData.append("infrastructureType", data.infrastructureType.toString());

    attachments.forEach((attachment) => {
      formData.append("files", {
        uri: attachment.uri,
        type: attachment.type,
        name: attachment.name,
      } as any);
    });

    return apiClient.postFormData<InfrastructureComplaint>(
      "/api/Complain/infrastructure",
      formData,
    );
  },

  async getComplaintsByAsset(
    assetId: string,
  ): Promise<ApiResponse<InfrastructureComplaint[]>> {
    return apiClient.get<InfrastructureComplaint[]>(
      `/api/Complain/infrastructure/asset/${assetId}`,
    );
  },

  async getComplaintById(
    complainId: number,
  ): Promise<ApiResponse<InfrastructureComplaint>> {
    return apiClient.get<InfrastructureComplaint>(
      `/api/Complain/infrastructure/${complainId}`,
    );
  },
};
```

---

## 🎨 DESIGN SYSTEM

### Colors

```typescript
// theme/colors.ts

export const ASSET_COLORS = {
  Library: "#3B82F6", // Blue
  Streetlight: "#EAB308", // Yellow
  Playground: "#22C55E", // Green
  Bin: "#EF4444", // Red
  BusStop: "#8B5CF6", // Purple
  Park: "#10B981", // Emerald
};

export const STATUS_COLORS = {
  Active: "#22C55E", // Green
  Inactive: "#6B7280", // Gray
  UnderMaintenance: "#EAB308", // Yellow
  Decommissioned: "#EF4444", // Red
};

export const COMPLAINT_STATUS_COLORS = {
  New: "#3B82F6", // Blue
  InProgress: "#EAB308", // Yellow
  Resolved: "#22C55E", // Green
  Closed: "#6B7280", // Gray
  Assigned: "#8B5CF6", // Purple
};
```

### Asset Icons

```typescript
// config/assetIcons.ts

export const ASSET_ICONS = {
  Library: "📚",
  Streetlight: "💡",
  Playground: "🎮",
  BusStop: "🚌",
  Park: "🌳",
  Bin: "🗑️",
};
```

---

## 🗺️ MAP IMPLEMENTATION

### React Native Maps Setup

```typescript
// components/InfrastructureMap.tsx

import React, { useState, useCallback } from 'react';
import MapView, { Marker, Polygon, Region } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import { InfrastructureAsset } from '../types/infrastructure';
import { ASSET_COLORS } from '../theme/colors';

interface Props {
  assets: InfrastructureAsset[];
  onAssetPress: (asset: InfrastructureAsset) => void;
  onRegionChange: (region: Region) => void;
}

export const InfrastructureMap: React.FC<Props> = ({
  assets,
  onAssetPress,
  onRegionChange,
}) => {
  const [region, setRegion] = useState<Region>({
    latitude: 7.8731,
    longitude: 80.7718,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const handleRegionChangeComplete = useCallback(
    (newRegion: Region) => {
      setRegion(newRegion);
      onRegionChange(newRegion);
    },
    [onRegionChange]
  );

  const pointAssets = assets.filter((a) => a.geometryType === 'Point');
  const polygonAssets = assets.filter((a) => a.geometryType === 'Polygon');

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Point markers */}
        {pointAssets.map((asset) => {
          if (asset.geometryType !== 'Point') return null;
          return (
            <Marker
              key={asset.assetId}
              coordinate={{
                latitude: asset.location.latitude,
                longitude: asset.location.longitude,
              }}
              onPress={() => onAssetPress(asset)}
              pinColor={ASSET_COLORS[asset.assetType]}
            />
          );
        })}

        {/* Polygon markers */}
        {polygonAssets.map((asset) => {
          if (asset.geometryType !== 'Polygon') return null;
          return (
            <Polygon
              key={asset.assetId}
              coordinates={asset.location.coordinates}
              fillColor={`${ASSET_COLORS[asset.assetType]}40`}
              strokeColor={ASSET_COLORS[asset.assetType]}
              strokeWidth={2}
              onPress={() => onAssetPress(asset)}
            />
          );
        })}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
```

---

## 📱 KEY COMPONENTS

### 1. Complaint Template Selector

```typescript
// components/ComplaintTemplateSelector.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AssetType } from '../types/enums';
import { COMPLAINT_TEMPLATES } from '../config/complaintTemplates';

interface Props {
  assetType: AssetType;
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string, subject: string) => void;
}

export const ComplaintTemplateSelector: React.FC<Props> = ({
  assetType,
  selectedTemplateId,
  onSelectTemplate,
}) => {
  const templates = COMPLAINT_TEMPLATES[assetType] || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's the problem?</Text>

      {templates.map((template) => (
        <TouchableOpacity
          key={template.id}
          style={[
            styles.button,
            selectedTemplateId === template.id && styles.buttonSelected,
          ]}
          onPress={() => onSelectTemplate(template.id, template.subject)}
        >
          <Text style={styles.icon}>{template.icon}</Text>
          <Text style={styles.label}>{template.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 16, color: '#1F2937' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  buttonSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  icon: { fontSize: 24, marginRight: 12 },
  label: { fontSize: 16, color: '#374151', flex: 1 },
});
```

### 2. Asset Category Grid

```typescript
// components/AssetCategoryGrid.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AssetType } from '../types/enums';
import { ASSET_ICONS, ASSET_COLORS } from '../config';

interface CategoryItem {
  type: AssetType;
  label: string;
  count?: number;
}

interface Props {
  categories: CategoryItem[];
  onCategoryPress: (assetType: AssetType) => void;
}

export const AssetCategoryGrid: React.FC<Props> = ({ categories, onCategoryPress }) => {
  return (
    <View style={styles.grid}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.type}
          style={[styles.tile, { borderColor: ASSET_COLORS[category.type] }]}
          onPress={() => onCategoryPress(category.type)}
        >
          <Text style={styles.icon}>{ASSET_ICONS[category.type]}</Text>
          <Text style={styles.label}>{category.label}</Text>
          {category.count !== undefined && (
            <Text style={styles.count}>{category.count}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  tile: {
    width: '48%',
    margin: '1%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  icon: { fontSize: 40, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  count: { fontSize: 12, color: '#6B7280', marginTop: 4 },
});
```

### 3. Asset Preview Bottom Sheet

```typescript
// components/AssetPreviewSheet.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { InfrastructureAsset } from '../types/infrastructure';
import { ASSET_ICONS } from '../config';

interface Props {
  asset: InfrastructureAsset;
  onViewDetails: () => void;
  onReportIssue: () => void;
  onClose: () => void;
}

export const AssetPreviewSheet: React.FC<Props> = ({
  asset,
  onViewDetails,
  onReportIssue,
  onClose,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{ASSET_ICONS[asset.assetType]}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{asset.assetName}</Text>
          <Text style={styles.code}>{asset.assetCode}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.buttonSecondary} onPress={onViewDetails}>
          <Text style={styles.buttonTextSecondary}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonPrimary} onPress={onReportIssue}>
          <Text style={styles.buttonTextPrimary}>Report Issue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  icon: { fontSize: 40, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  code: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12 },
  buttonSecondary: {
    flex: 1,
    padding: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    flex: 1,
    padding: 14,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonTextSecondary: { fontSize: 16, fontWeight: '600', color: '#374151' },
  buttonTextPrimary: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
```

---

## 🔌 OFFLINE SUPPORT

```typescript
// services/offlineService.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { complaintService } from "./complaintService";
import { CreateComplaintDto } from "../types/complaint";

const QUEUE_KEY = "complaint_queue";

interface QueuedComplaint {
  id: string;
  data: CreateComplaintDto;
  attachments?: Array<{ uri: string; type: string; name: string }>;
  timestamp: number;
}

export const offlineService = {
  async queueComplaint(
    data: CreateComplaintDto,
    attachments?: Array<{ uri: string; type: string; name: string }>,
  ): Promise<void> {
    const queue = await this.getQueue();
    queue.push({
      id: `${Date.now()}_${Math.random()}`,
      data,
      attachments,
      timestamp: Date.now(),
    });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  async getQueue(): Promise<QueuedComplaint[]> {
    try {
      const queueJson = await AsyncStorage.getItem(QUEUE_KEY);
      return queueJson ? JSON.parse(queueJson) : [];
    } catch {
      return [];
    }
  },

  async syncQueue(): Promise<{ success: number; failed: number }> {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) return { success: 0, failed: 0 };

    const queue = await this.getQueue();
    let success = 0;
    let failed = 0;
    const remainingQueue: QueuedComplaint[] = [];

    for (const item of queue) {
      try {
        if (item.attachments?.length) {
          await complaintService.createComplaintWithAttachments(
            item.data,
            item.attachments,
          );
        } else {
          await complaintService.createComplaint(item.data);
        }
        success++;
      } catch {
        failed++;
        remainingQueue.push(item);
      }
    }

    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));
    return { success, failed };
  },
};
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Setup (Week 1)

- [ ] Install all dependencies
- [ ] Configure environment variables
- [ ] Set up API client with authentication
- [ ] Create type definitions (enums, interfaces)
- [ ] Set up complaint templates configuration
- [ ] Create color/icon theme configuration

### Phase 2: Core Services (Week 1-2)

- [ ] Implement infrastructure service
- [ ] Implement complaint service
- [ ] Implement offline service
- [ ] Create error handling utilities
- [ ] Set up AsyncStorage for tokens

### Phase 3: Map & Asset Display (Week 2-3)

- [ ] Create Infrastructure Map component
- [ ] Implement point marker rendering
- [ ] Implement polygon rendering
- [ ] Add search functionality
- [ ] Add filter functionality
- [ ] Implement bounds-based data loading
- [ ] Add asset preview bottom sheet

### Phase 4: Asset Details (Week 3)

- [ ] Create Asset Detail screen
- [ ] Display type-specific asset information
- [ ] Show complaint history section
- [ ] Add navigation to complaint form

### Phase 5: Complaint Submission (Week 4)

- [ ] Create Complaint Template Selector
- [ ] Create Asset Complaint Form
- [ ] Implement form validation
- [ ] Add attachment handling (photo/video/voice)
- [ ] Implement complaint submission
- [ ] Add offline queue support

### Phase 6: Navigation & Categories (Week 5)

- [ ] Create Complaint Categories screen
- [ ] Create Infrastructure Categories screen
- [ ] Set up navigation structure
- [ ] Implement deep linking
- [ ] Test all navigation flows

### Phase 7: Polish & Testing (Week 6)

- [ ] Add loading states
- [ ] Implement error handling
- [ ] Add success/error toasts
- [ ] Test offline functionality
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] End-to-end testing

---

## 🧪 TESTING SCENARIOS

### Test User Flow 1: Submit Complaint via Complains Tab

1. Open app → Go to Complains tab
2. Tap "Streetlight" category tile
3. Map opens showing only streetlights
4. Search for "Main Street" or browse map
5. Tap specific streetlight marker
6. Bottom sheet shows with "Report Issue" button
7. Tap "Report Issue"
8. Complaint form opens with 6 predefined options
9. Tap "Light not working"
10. Subject auto-fills to "Light not working"
11. Optionally add description "Light has been off for 3 days"
12. Tap camera button, take photo
13. Photo appears in preview
14. Tap Submit
15. Success message appears
16. Navigate back to map

### Test User Flow 2: View Asset Details via Infrastructure Tab

1. Open app → Go to Infrastructure tab
2. Tap "Park" category tile
3. Map opens showing only parks (polygons)
4. Tap on Central Park polygon
5. Bottom sheet shows with "View Details" button
6. Tap "View Details"
7. Asset Detail screen opens showing:
   - Park name, code, status
   - Area: 5000 sq meters
   - Facilities: Playground, Parking, Restrooms
   - Opening hours: 6 AM - 9 PM
   - Recent complaints (5)
8. Scroll to complaint history
9. See complaints with status indicators
10. Tap "See All" to view full history
11. Tap "Report Issue" button
12. Complaint form opens with park-specific templates

### Test Offline Flow

1. Enable airplane mode
2. Submit complaint with photo
3. See "Saved for later" message
4. Complaint queued locally
5. Disable airplane mode
6. App auto-syncs queued complaint
7. Success notification appears

---

## 🎯 SUCCESS CRITERIA

### Functional Requirements

✅ Users can view all 6 asset types on interactive map  
✅ Map loads assets within viewport bounds (performance)  
✅ Search finds assets by name and code  
✅ Filter by asset type and status works  
✅ Point assets show as markers, area assets as polygons  
✅ Tapping asset shows preview with actions  
✅ Asset detail screen shows all type-specific information  
✅ Complaint history displays for each asset  
✅ Users can submit complaints with predefined templates  
✅ "Other" option allows free-form complaints  
✅ Photos, videos, voice can be attached  
✅ Offline complaints are queued and synced  
✅ Council context (X-Council-Id) included in all API calls

### Non-Functional Requirements

✅ Map renders smoothly with 100+ markers  
✅ API calls complete within 3 seconds  
✅ Attachment upload shows progress  
✅ Works offline (view cached data, queue complaints)  
✅ Syncs automatically when connection restored  
✅ Follows mobile UI/UX best practices  
✅ Accessible (screen reader support, touch targets 44x44)  
✅ Supports iOS and Android

---

## 📝 IMPORTANT NOTES

### Backend Integration

- **Base URL**: Use `EXPO_PUBLIC_API_URL` from environment
- **Council Header**: Always include `X-Council-Id` header in all requests
- **Authentication**: Use Keycloak tokens stored in AsyncStorage
- **Response Format**: All endpoints return `{ success, message, data, errors }`

### Asset Reading Only

- Mobile app is **READ-ONLY** for infrastructure assets
- Users cannot create/edit/delete assets
- Only council staff can manage assets via web app

### Complaint Permissions

- All authenticated users can submit complaints
- Users can only view their own complaints (backend enforces this)
- Status updates are admin/staff only

### File Upload Limits

- Photos: Max 5MB per image, up to 5 images
- Videos: Max 50MB, 1 video per complaint
- Voice: Max 5MB, 1 audio file per complaint

### Reuse Existing Code

- **Attachment handling**: Reuse from General/Project complaints
- **Authentication**: Use existing Keycloak integration
- **Error handling**: Use existing error utilities
- **Toast messages**: Use existing toast component

---

## 🚀 QUICK START COMMAND

When you're ready to implement, ask Copilot:

```
"Implement the infrastructure map screen based on MOBILE-COPILOT-INSTRUCTIONS.md.
Start with the InfrastructureMap component that shows assets on React Native Maps
with point markers and polygons. Include search, filter, and bounds-based loading."
```

Then proceed screen by screen following the checklist above.

---

**END OF INSTRUCTIONS** - You now have everything needed to implement this feature! 🎉
