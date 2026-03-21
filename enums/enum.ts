export enum ComplainStatus {
  New = 0,
  Assigned = 1,
  InProgress = 2,
  Closed = 3,
}
export enum EntityType {
  Complain = 0,
  LightpostComplain = 1,
  ProjectComplain = 2,
  GeneralComplain = 3,
  GarbageComplain = 4,
  Project = 5,
  Ticket = 6,
  ProjectTicket = 7,
  InternalTicket = 8,
  ComplainTicket = 9,
  InfrastructureComplain = 10,
}
export enum WorkpackageStatus {
  New = 0,
  InProgress = 1,
  Close = 2,
}

export enum ProjectStatus {
  New = 0,
  InProgress = 1,
  Completed = 2,
  OnHold = 3,
}

export enum ProjectType {
  // Infrastructure
  Road = 0,
  Bridge = 1,
  Culvert = 2,
  StreetLighting = 3,

  // Water & Sanitation
  WaterSupply = 4,
  Pipeline = 5,
  Drainage = 6,
  Sewerage = 7,
  Irrigation = 8,
  Reservoir = 9,
  WaterTreatmentPlant = 10,

  // Buildings & Facilities
  Building = 11,
  Park = 12,
  RecreationArea = 13,
  CommunityCenter = 14,
  PublicLibrary = 15,
  HealthCenter = 16,

  // Waste Management
  WasteManagement = 17,
  Landfill = 18,
  RecyclingCenter = 19,

  // Other
  Other = 20,
}

export enum NotificationStatus {
  Created,
  Rated,
}

export enum NotificationCategory {
  ComplainTicketCreation,
  ComplainTicketUpdate,
  GeneralAnnouncement,
}

export enum NotificationType {
  Info,
  Warning,
  Rating,
}

export enum CommentType {
  GeneralComplain,
  LightpostComplain,
  ProjectComplain,
  GarbageComplain,
  InfrastructureComplain,
}

export enum ProjectProgressApprovedStatus {
  Pending,
  Approved,
  Rejected,
}
