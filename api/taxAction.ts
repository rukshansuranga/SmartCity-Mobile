import { fetchWrapper } from "@/lib/fetchWrapper";
import {
  ApiResponse,
  LandParcel,
  LandParcelWithArrears,
  PaymentHistoryByResidentDto,
  QuarterlyTaxByResidentDto,
  UnpaidQuartersByResidentDto,
} from "@/types";

export async function getOutstandingAmountByResidentId(
  residentId: string,
): Promise<ApiResponse<number>> {
  return fetchWrapper.get(`tax/total-outstanding/${residentId}`);
}

export async function getArrearsByResidentId(
  residentId: string,
): Promise<ApiResponse<LandParcelWithArrears[]>> {
  return fetchWrapper.get(`tax/arrears/resident/${residentId}`);
}

export async function getLandparcelsByResidentId(
  residentId: string,
): Promise<ApiResponse<LandParcel[]>> {
  return fetchWrapper.get(`tax/landparcels/resident/${residentId}`);
}

export async function getPaymentHistoryByResidentId(
  residentId: string,
): Promise<ApiResponse<PaymentHistoryByResidentDto[]>> {
  return fetchWrapper.get(`tax/payment-history/${residentId}`);
}

export async function getQuarterlyTaxByResidentId(
  residentId: string,
): Promise<ApiResponse<QuarterlyTaxByResidentDto[]>> {
  return fetchWrapper.get(`tax/quarterly-tax/${residentId}`);
}

export async function getUnpaidQuartersByResidentId(
  residentId: string,
): Promise<ApiResponse<UnpaidQuartersByResidentDto[]>> {
  return fetchWrapper.get(`tax/unpaid-quarters/resident/${residentId}`);
}

export async function resetArrearsRecoveryStatus(
  arrearsIds: number[],
): Promise<ApiResponse<{ updatedCount: number; arrearsIds: number[] }>> {
  return fetchWrapper.post(`tax/reset-arrears-status`, {
    ArrearsIds: arrearsIds,
  });
}
