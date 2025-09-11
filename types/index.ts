import {
  CommentType,
  NotificationStatus,
  NotificationType,
  ProjectProgressApprovedStatus,
  ProjectStatus,
  ProjectType,
} from "@/enums/enum";

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  errors: string[];
}

export enum WorkpackageStatus {
  New,
  InProgress,
  Close,
}

export type Client = {
  clientId: string;
  addressLine1?: string;
  addressLine2?: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  city?: string;
};

export type Complain = {
  complainId: number;
  subject: string;
  detail?: string;
  status?: WorkpackageStatus;
  clientId?: string;
  client: {
    clientId?: string;
    firstName?: string;
    lastName?: string;
    mobile?: string;
  };
  complainType?: string;
  comments?: Comment[];
  createdAt?: string;
};

export type GeneralComplain = Complain & {
  isPrivate: boolean;
};

export type ProjectComplain = Complain & {
  projectId: string;
  project?: {
    id: number;
    subject: string;
    description: string;
    status: ProjectStatus;
  };
};

export type Comment = {
  commentId?: number;
  text: string;
  entityType: EntityType;
  entityId: string;
  isPrivate?: boolean;
  clientId?: string;
  client?: {
    clientId?: string;
    firstName?: string;
    lastName?: string;
    mobile?: string;
    name?: string;
  };
  userId?: string;
  user?: {
    userId?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
  };
  type?: CommentType;
  createdAt?: string;
  updatedAt?: string;
};

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

export type Notification = {
  id: number;
  subject: string;
  message?: string;
  clientId: string;
  status: NotificationStatus;
  type: NotificationType;
  complain: Complain;
  isRead: boolean;
};

export type Project = {
  id: number;
  subject: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  city: string;
  latitude: number;
  longitude: number;
  estimatedCost: number;
  tenderOpeningDate: string;
  tenderClosingDate: string;
};

export type ProjectProgress = {
  projectId: string;
  summary: string;
  description?: string;
  progressDate: string;
  projectProgressApprovedStatus: ProjectProgressApprovedStatus;
  progressPercentage: number;
  approvedBy?: string;
  approvedByUser?: {
    userId: string;
    firstName: string;
    lastName?: string;
  };
};
