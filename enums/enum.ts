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
