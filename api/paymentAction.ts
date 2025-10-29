import { fetchWrapper } from "@/lib/fetchWrapper";

/**
 * Request body for creating a payment intent
 */
export interface CreatePaymentIntentRequest {
  amount: number; // Amount in cents (e.g., 10000 for LKR 100.00)
  currency: string; // e.g., "lkr" for Sri Lankan Rupee
  residentId: string;
  arrearsIds: number[];
  quarterlyTaxIds: string[]; // Format: "taxableUnitID-taxYear-quarter"
  description: string;
}

/**
 * Response from creating a payment intent
 */
export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Request body for confirming a payment
 */
export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  residentId: string;
  arrearsIds: number[];
  quarterlyTaxIds: string[];
}

/**
 * Response from confirming a payment
 */
export interface ConfirmPaymentResponse {
  success: boolean;
  transactionId: string;
  receiptUrl?: string;
  message?: string;
}

/**
 * Creates a Stripe payment intent on the backend
 * @param request Payment intent details
 * @returns Payment intent response with client secret
 */
export async function createPaymentIntent(
  request: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> {
  return fetchWrapper.post("Payment/create-intent", request);
}

/**
 * Confirms a payment after successful Stripe payment
 * @param request Payment confirmation details
 * @returns Confirmation response with transaction details
 */
export async function confirmPayment(
  request: ConfirmPaymentRequest
): Promise<ConfirmPaymentResponse> {
  return fetchWrapper.post("Payment/confirm", request);
}

/**
 * Helper function to format quarterly tax IDs for the API
 * @param taxableUnitID Taxable unit ID
 * @param taxYear Tax year
 * @param quarter Quarter number (1-4)
 * @returns Formatted quarterly tax ID string
 */
export function formatQuarterlyTaxId(
  taxableUnitID: number,
  taxYear: number,
  quarter: number
): string {
  return `${taxableUnitID}-${taxYear}-${quarter}`;
}

/**
 * Converts amount from LKR to cents (Stripe requires amounts in smallest currency unit)
 * @param amount Amount in LKR
 * @returns Amount in cents
 */
export function convertToCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Converts amount from cents to LKR
 * @param cents Amount in cents
 * @returns Amount in LKR
 */
export function convertFromCents(cents: number): number {
  return cents / 100;
}
