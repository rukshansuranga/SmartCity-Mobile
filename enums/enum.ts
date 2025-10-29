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
  Road = 0,
  Building = 1,
  Irrigation = 2,
}

export enum NotificationStatus {
  Created,
  Sent,
  Delivered,
  Failed,
  ReSent,
  Rated,
  Completed,
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
}

export enum ProjectProgressApprovedStatus {
  Pending,
  Approved,
  Rejected,
}
