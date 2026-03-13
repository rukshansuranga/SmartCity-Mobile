// Infrastructure Asset Types and Interfaces

export enum AssetType {
  Library = 0,
  Streetlight = 1,
  Playground = 2,
  Bin = 3,
  BusStop = 4,
  Park = 5,
}

export enum AssetStatus {
  Active = 0,
  Inactive = 1,
  UnderMaintenance = 2,
  Decommissioned = 3,
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

// Base location types
export interface PointLocation {
  latitude: number;
  longitude: number;
}

export interface PolygonLocation {
  coordinates: { latitude: number; longitude: number }[];
}

// Base infrastructure asset interface
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

// Specific asset type interfaces
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

// Union type for all infrastructure assets
export type InfrastructureAsset =
  | Library
  | Streetlight
  | Playground
  | Bin
  | BusStop
  | Park;

// Asset counts interface
export interface AssetCounts {
  [AssetType.Library]: number;
  [AssetType.Streetlight]: number;
  [AssetType.Playground]: number;
  [AssetType.Bin]: number;
  [AssetType.BusStop]: number;
  [AssetType.Park]: number;
}

// Infrastructure complaint types
export interface InfrastructureComplaint {
  complainId: number;
  subject: string;
  detail: string;
  status: number; // ComplaintStatus
  assetId: string;
  infrastructureType: number; // Maps to AssetType
  rating?: number;
  ratedBy?: string;
  ratingReview?: string;
  sentiment?: string;
  summary?: string;
  residentId?: string;
  resident?: {
    residentId?: string;
    firstName?: string;
    lastName?: string;
    mobile?: string;
  };
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface CreateInfrastructureComplaintDto {
  subject: string;
  detail: string;
  status: number;
  assetId: string;
  infrastructureType: number;
  residentId?: string;
}

// Complaint template interface
export interface ComplaintTemplate {
  id: string;
  label: string;
  icon: string;
  subject: string;
  promptForDetails?: string;
}

// Helper function to get infrastructure type number from AssetType
export const getInfrastructureTypeValue = (assetType: AssetType): number => {
  return assetType;
};

// Helper function to get AssetType from infrastructure type number
export const getAssetTypeFromValue = (value: number): AssetType => {
  return value as AssetType;
};

// Asset type labels
export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  [AssetType.Library]: "Library",
  [AssetType.Streetlight]: "Streetlight",
  [AssetType.Playground]: "Playground",
  [AssetType.Bin]: "Bin",
  [AssetType.BusStop]: "Bus Stop",
  [AssetType.Park]: "Park",
};

// Asset status labels
export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  [AssetStatus.Active]: "Active",
  [AssetStatus.Inactive]: "Inactive",
  [AssetStatus.UnderMaintenance]: "Under Maintenance",
  [AssetStatus.Decommissioned]: "Decommissioned",
};
