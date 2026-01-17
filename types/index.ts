import {
  CommentType,
  EntityType,
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

export type Council = {
  value: string;
  label: string;
};

export type TokenPayload = {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
};

export type KeycloakUserInfo = {
  sub: string; // User ID
  email_verified: boolean;
  name: string; // Full name
  mobile?: string;
  councils: string[]; // Array of council names
  preferred_username: string; // Username
  given_name: string; // First name
  family_name: string; // Last name
  email: string;
};

export type Resident = {
  residentId: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  nic?: string;
  ownerType?: string; // Individual, Company, Government, etc.
  email?: string;
};

export type Complain = {
  complainId: number;
  subject: string;
  detail?: string;
  status?: WorkpackageStatus;
  residentId?: string;
  resident: {
    residentId?: string;
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
    projectId: number;
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
  residentId?: string;
  resident?: {
    residentId?: string;
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

export type Notification = {
  id: number;
  subject: string;
  message?: string;
  residentId: string;
  status: NotificationStatus;
  type: NotificationType;
  complain: Complain;
  isRead: boolean;
  data?: NotificationData;
};

export type NotificationData = {
  complainId?: string;
  projectId?: string;
  complainSubject?: string;
  complainCreatedDate?: string;
  projectProgressId?: string;
  coordinatorId?: string;
  rating?: number;
};

export type Project = {
  projectId: number;
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

export type Attachment = {
  attachmentId: number;
  fileName: string;
  thumbnailFileName?: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  description?: string;
  entityType: EntityType; // Now uses enum EntityType
  entityId: number;
  attachmentType?: string; // "Document", "Image", "Video", etc.
  category?: string; // "Specification", "Progress", "Evidence", etc.
  orderIndex?: number;
  createdAt?: Date;
  updatedAt?: Date;
  sourceUrl?: string;
  thumbnailUrl?: string;
};

export type AttachmentUpload = {
  file: ExpoFileObject;
  description?: string;
  attachmentType?: string;
  category?: string;
  attachmentId?: number;
  thumbnailUrl?: string;
  sourceUrl?: string;
  entityType?: EntityType; // Optional, for upload context
};

export type ExpoFileObject = {
  uri: string;
  name: string;
  type: string;
};

export interface Assessment {
  assessmentID: number;
  taxableUnitID: number;
  taxYear: number;
  annualValue: number;
  taxRate: number;
  annualTaxAmount: number;
  assessmentDate: string; // ISO 8601 string format for LocalDateTime

  arrears?: Arrears[];
}

export interface Arrears {
  arrearsID: number;
  assessmentId: number;
  dueQuarter: number;
  originalDueAmount: number;
  outstandingBalance: number;
  surchargeAccrued?: number | null;
  recoveryStatus: string;
  assessment: Assessment;
}

export interface TaxableUnit {
  taxableUnitID: number;
  landParcelId: number;
  unitReference: string;
  unitType: string;
  floorAreaSqm?: number; // Optional property
  isActive: boolean;

  assessments?: Assessment[];
}

export interface LandParcel {
  landParcelID: number;
  assessmentNo: string;
  streetAddress: string;
  gnDivision: string;
  wardNo: string;
  deedAbstractRef: string;
  surveyPlanNo: string;
  dateRegistered: string; // ISO 8601 string format for LocalDateTime

  taxableUnits?: TaxableUnit[];
}

export interface PaymentHistoryByResidentDto {
  paymentId: string;
  amount: number;
  date: string; // ISO 8601 string format
  description: string;

  taxableUnits?: TaxableUnitPaymentHistoryDto[];
}

export interface TaxableUnitPaymentHistoryDto {
  taxableUnitId: number;
  unitReference: string;
  unitType: string;
  payments: PaymentDetailDto[];
}

export interface PaymentDetailDto {
  paymentId: number;
  assessmentId: number;
  taxYear: number;
  paymentDate: string; // ISO 8601 string format for LocalDateTime
  quarter?: number; // Optional property
  amountPaid: number;
  discountApplied?: number; // Optional property
  surchargeApplied?: number; // Optional property
  paymentMethod: string;
  receiptNumber: string;
}

export interface QuarterlyTaxByResidentDto {
  landParcelID: number;
  streetAddress: string;
  taxableUnits: TaxableUnitQuarterlyTaxDto[];
}

export interface TaxableUnitQuarterlyTaxDto {
  taxableUnitID: number;
  unitReference: string;
  unitType: string;
  quarterlyTaxes: QuarterlyTaxDetailDto[];
}

export interface QuarterlyTaxDetailDto {
  taxYear: number;
  quarter: number;
  quarterName: string; // e.g., "Q1 2025", "Q4 2025"
  quarterlyTaxAmount: number;
  discountAmount?: number; // 10% discount if applicable
  amountDue: number; // Final amount after discount
  isDiscountApplicable: boolean;
  discountDeadline?: string; // ISO 8601 string format for DateTime
  isPaid: boolean;
  paidDate?: string; // ISO 8601 string format for DateTime
}

// Arrears response structure from API
export interface TaxableUnitWithArrears {
  taxableUnitID: number;
  unitReference: string;
  unitType: string;
  arrears: Arrears[];
}

export interface LandParcelWithArrears {
  landParcelID: number;
  streetAddress: string;
  taxableUnits: TaxableUnitWithArrears[];
}

export interface PaymentHistoryResponseDto {
  paymentID: number;
  paymentDate: string; // ISO string
  residentName: string;
  residentId: string;
  totalAmount: number;
  paymentType: number; // Assuming enum, but as number
  paymentMethod: string;
  receiptNumber: string;
  paymentDetails: PaymentDetailItemDto[];
}

export interface PaymentDetailItemDto {
  taxableUnitID: number;
  unitType: string;
  landParcelID: number;
  landParcelAddress: string;
  assessmentYear: number;
  annualValue: number;
  taxRate: number;
  quarters: QuarterDetailDto[];
}

export interface QuarterDetailDto {
  quarter: number;
  quarterAmount: number;
  discount: number;
  surcharge: number;
}
