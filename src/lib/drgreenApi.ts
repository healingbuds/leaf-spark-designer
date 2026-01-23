/**
 * Dr. Green DAPP API Client
 * 
 * This module handles all Dr. Green API interactions through the Edge Function proxy.
 * It implements the exact signing logic from the WordPress legacy system.
 * 
 * Signing Rules (from WordPress legacy):
 * - Method A (Body Sign): POST, DELETE, and singular GET requests sign the JSON body
 * - Method B (Query Sign): GET list endpoints sign the query string parameters
 */

import { supabase } from '@/integrations/supabase/client';

// Country code conversion (Alpha-2 to Alpha-3 ISO codes)
export const countryCodeMap: Record<string, string> = {
  PT: 'PRT',
  GB: 'GBR',
  ZA: 'ZAF',
  TH: 'THA',
  US: 'USA',
};

// Convert Alpha-2 to Alpha-3 country code
export const toAlpha3 = (code: string): string => countryCodeMap[code] || code;

// Types matching exact Dr. Green API payload structure
export interface LegacyClientPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneCode: string;
  phoneCountryCode: string;
  contactNumber: string;
  shipping: {
    address1: string;
    address2?: string;
    landmark?: string;
    city: string;
    state?: string;
    country: string;
    countryCode: string;
    postalCode: string;
  };
  medicalRecord: {
    dob: string; // YYYY-MM-DD format
    gender: string;
    // Required boolean flags
    medicalHistory0: boolean; // Heart problems
    medicalHistory1: boolean; // Cancer treatment
    medicalHistory2: boolean; // Immunosuppressants
    medicalHistory3: boolean; // Liver disease
    medicalHistory4: boolean; // Psychiatric history
    medicalHistory5: string[]; // Diagnosed with (required array)
    medicalHistory6?: boolean; // Suicidal history (optional)
    medicalHistory7?: string[]; // Family conditions (optional array)
    medicalHistory7Relation?: string; // Relation (optional, only if history7 not "none")
    medicalHistory8?: boolean; // Drug abuse history (required per API, optional per legacy)
    medicalHistory9: boolean; // Alcohol abuse history
    medicalHistory10: boolean; // Drug services care
    medicalHistory11?: string; // Alcohol units per week (optional)
    medicalHistory12: boolean; // Cannabis to reduce meds
    medicalHistory13: string; // How often cannabis (required)
    medicalHistory14: string[]; // How used cannabis (required array)
    medicalHistory15?: string; // Cannabis amount per day (optional)
    medicalHistory16?: boolean; // Cannabis reaction (optional)
    prescriptionsSupplements?: string; // Current prescriptions (optional)
    // Optional condition/treatment fields
    medicalConditions?: string[];
    otherMedicalCondition?: string;
    medicinesTreatments?: string[];
    otherMedicalTreatments?: string;
  };
  clientBusiness?: {
    businessType?: string;
    name: string;
    address1?: string;
    address2?: string;
    landmark?: string;
    city?: string;
    state?: string;
    country?: string;
    countryCode?: string;
    postalCode?: string;
  };
}

export interface CartItem {
  strainId: string;
  quantity: number;
}

export interface AddToCartPayload {
  items: CartItem[];
  clientCartId: string;
}

export interface PlaceOrderPayload {
  clientId: string;
}

export interface DrGreenResponse<T = unknown> {
  data: T | null;
  error: string | null;
  success?: boolean;
  message?: string;
}

export interface ClientResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isKYCVerified: boolean;
  adminApproval: string;
  isActive: boolean;
  clientCart?: Array<{ id: string }>;
  kycLink?: string;
}

export interface StrainResponse {
  id: string;
  name: string;
  description: string;
  type: string;
  thc: string;
  thcContent?: number;
  cbd?: string;
  cbdContent?: number;
  flavour?: string;
  feelings?: string;
  helpsWith?: string;
  imageUrl?: string;
  images?: string[];
  retailPrice: number;
  availability: boolean;
  stock?: number;
}

export interface CartResponse {
  id: string;
  clientId: string;
  items: Array<{
    strainId: string;
    quantity: number;
    strain?: StrainResponse;
  }>;
  totalAmount?: number;
}

export interface OrderResponse {
  id: string;
  clientId: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  items: Array<{
    strainId: string;
    quantity: number;
    unitPrice: number;
  }>;
  createdAt: string;
}

/**
 * Call the Dr. Green proxy edge function
 */
async function callProxy<T = unknown>(
  action: string,
  data?: Record<string, unknown>
): Promise<DrGreenResponse<T>> {
  try {
    console.log(`[DrGreen API] Calling action: ${action}`, data);
    
    const { data: response, error } = await supabase.functions.invoke('drgreen-proxy', {
      body: { action, ...data },
    });

    if (error) {
      console.error('[DrGreen API] Error:', error);
      return { data: null, error: error.message, success: false };
    }

    // Handle legacy response format
    if (response?.success === false || response?.success === 'false') {
      return { 
        data: null, 
        error: response.message || 'Request failed', 
        success: false,
        message: response.message 
      };
    }

    return { 
      data: response?.data || response as T, 
      error: null, 
      success: true,
      message: response?.message 
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[DrGreen API] Exception:', err);
    return { data: null, error: message, success: false };
  }
}

// ===========================================
// CLIENT OPERATIONS
// ===========================================

/**
 * Create a new client (patient) - matches WordPress POST /clients/
 * Uses Body Signing (Method A)
 */
export async function createClient(payload: LegacyClientPayload): Promise<DrGreenResponse<ClientResponse>> {
  return callProxy<ClientResponse>('create-client-legacy', { payload });
}

/**
 * Get client details - matches WordPress GET /clients/{clientId}
 * Uses Body Signing (Method A) - signs {"clientId": "..."}
 */
export async function getClient(clientId: string): Promise<DrGreenResponse<ClientResponse>> {
  return callProxy<ClientResponse>('get-client', { clientId });
}

/**
 * Refresh client data (sync KYC status, etc.)
 */
export async function refreshClient(clientId: string): Promise<DrGreenResponse<ClientResponse>> {
  return callProxy<ClientResponse>('get-client', { clientId });
}

// ===========================================
// STRAIN/PRODUCT OPERATIONS  
// ===========================================

/**
 * Get all strains by country - matches WordPress GET /strains?...
 * Uses Query Signing (Method B) - signs "orderBy=desc&take=10&page=1&countryCode=XXX"
 */
export async function getStrains(countryCode: string): Promise<DrGreenResponse<StrainResponse[]>> {
  const alpha3Code = toAlpha3(countryCode);
  return callProxy<StrainResponse[]>('get-strains-legacy', { 
    countryCode: alpha3Code,
    orderBy: 'desc',
    take: 20,
    page: 1
  });
}

/**
 * Get single strain details - matches WordPress GET /strains/{strainId}
 * Uses Body Signing (Method A) - signs {"strainId": "..."}
 */
export async function getStrain(strainId: string): Promise<DrGreenResponse<StrainResponse>> {
  return callProxy<StrainResponse>('get-strain', { strainId });
}

// ===========================================
// CART OPERATIONS
// ===========================================

/**
 * Get cart for client - matches WordPress GET /carts?clientId=...
 * Uses Query Signing (Method B)
 */
export async function getCart(clientId: string): Promise<DrGreenResponse<CartResponse>> {
  return callProxy<CartResponse>('get-cart-legacy', { 
    clientId,
    orderBy: 'desc',
    take: 10,
    page: 1
  });
}

/**
 * Add item to cart - matches WordPress POST /carts
 * Uses Body Signing (Method A)
 */
export async function addToCart(payload: AddToCartPayload): Promise<DrGreenResponse<CartResponse>> {
  return callProxy<CartResponse>('add-to-cart', { data: payload });
}

/**
 * Remove item from cart - matches WordPress DELETE /carts/{basketId}?strainId={strainId}
 * Uses Body Signing (Method A) - signs {"cartId": basketId}
 */
export async function removeFromCart(basketId: string, strainId: string): Promise<DrGreenResponse<CartResponse>> {
  return callProxy<CartResponse>('remove-from-cart', { 
    cartId: basketId, 
    strainId 
  });
}

/**
 * Empty entire cart - matches WordPress DELETE /carts/{basketId}
 * Uses Body Signing (Method A)
 */
export async function emptyCart(basketId: string): Promise<DrGreenResponse<{ success: boolean }>> {
  return callProxy<{ success: boolean }>('empty-cart', { cartId: basketId });
}

// ===========================================
// ORDER OPERATIONS
// ===========================================

/**
 * Place order - matches WordPress POST /orders
 * Uses Body Signing (Method A)
 */
export async function placeOrder(payload: PlaceOrderPayload): Promise<DrGreenResponse<OrderResponse>> {
  return callProxy<OrderResponse>('place-order', { data: payload });
}

/**
 * Get order details - matches WordPress GET /orders/{orderId}
 * Uses Body Signing (Method A) - signs {"orderId": "..."}
 */
export async function getOrder(orderId: string): Promise<DrGreenResponse<OrderResponse>> {
  return callProxy<OrderResponse>('get-order', { orderId });
}

/**
 * Get all orders for client - matches WordPress GET /client/{clientId}/orders
 * Uses Body Signing (Method A) - signs {"clientId": "..."}
 */
export async function getOrders(clientId: string): Promise<DrGreenResponse<OrderResponse[]>> {
  return callProxy<OrderResponse[]>('get-orders', { clientId });
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Parse phone number into components matching WordPress format
 * 
 * CRITICAL: First AML requires phone numbers with + prefix.
 * This function ensures phoneCode ALWAYS starts with +
 */
export function parsePhoneNumber(fullNumber: string): { 
  phoneCode: string; 
  phoneCountryCode: string; 
  contactNumber: string 
} {
  // Remove all non-digit characters except +
  const cleaned = fullNumber.replace(/[^\d+]/g, '');
  
  // Extract country code (first 1-4 digits after +)
  const match = cleaned.match(/^\+(\d{1,4})(.*)/);
  
  // Map common prefixes to country codes
  const prefixToCountry: Record<string, string> = {
    '351': 'PT',
    '44': 'GB',
    '27': 'ZA',
    '66': 'TH',
    '1': 'US',
  };
  
  if (match) {
    const prefix = match[1];
    const number = match[2];
    
    return {
      phoneCode: `+${prefix}`, // Always include + prefix for First AML
      phoneCountryCode: prefixToCountry[prefix] || 'PT',
      contactNumber: number,
    };
  }
  
  // Try to detect country code without + prefix
  // Check if it starts with a known country prefix
  for (const [prefix, countryCode] of Object.entries(prefixToCountry)) {
    if (cleaned.startsWith(prefix)) {
      const number = cleaned.slice(prefix.length);
      return {
        phoneCode: `+${prefix}`, // Ensure + prefix for First AML
        phoneCountryCode: countryCode,
        contactNumber: number,
      };
    }
  }
  
  // Default fallback - always include + prefix
  return {
    phoneCode: '+351',
    phoneCountryCode: 'PT',
    contactNumber: cleaned.replace(/^\+/, ''),
  };
}

/**
 * Build legacy client payload from form data - matches exact Dr. Green API spec
 * 
 * Medical History Field Mapping (per API docs):
 * - medicalHistory0: Heart problems (boolean, required)
 * - medicalHistory1: Cancer treatment (boolean, required)
 * - medicalHistory2: Immunosuppressants (boolean, required)
 * - medicalHistory3: Liver disease (boolean, required)
 * - medicalHistory4: Psychiatric history (boolean, required)
 * - medicalHistory5: Diagnosed conditions (array of strings, required)
 * - medicalHistory6: Suicidal history (boolean, optional)
 * - medicalHistory7: Family history conditions (array of strings, optional)
 * - medicalHistory7Relation: Family relation (string, optional, only if history7 not "none")
 * - medicalHistory8: Drug abuse history (boolean, required)
 * - medicalHistory9: Alcohol abuse history (boolean, required)
 * - medicalHistory10: Drug services care (boolean, required)
 * - medicalHistory11: Alcohol units per week (string, required)
 * - medicalHistory12: Using cannabis to reduce meds (boolean, required)
 * - medicalHistory13: How often cannabis used (string, required - everyday/every_other_day/1_2_times_per_week/never)
 * - medicalHistory14: Cannabis usage methods (array of strings, required)
 * - medicalHistory15: Cannabis amount per day (string, optional)
 * - medicalHistory16: Cannabis reaction (boolean, optional)
 * - prescriptionsSupplements: Current prescriptions (string, optional)
 */
export function buildLegacyClientPayload(formData: {
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender?: string;
  };
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    state?: string;
  };
  business?: {
    isBusiness?: boolean;
    businessType?: string;
    businessName?: string;
    businessAddress1?: string;
    businessAddress2?: string;
    businessCity?: string;
    businessState?: string;
    businessCountryCode?: string;
    businessPostalCode?: string;
  };
  medicalHistory?: {
    // Safety gates
    heartProblems?: 'yes' | 'no';
    psychosisHistory?: 'yes' | 'no';
    cannabisReaction?: 'yes' | 'no';
    // Conditions and medications
    conditions?: string[];
    medications?: string[];
    // All medicalHistory fields
    medicalHistory0?: boolean;
    medicalHistory1?: boolean;
    medicalHistory2?: boolean;
    medicalHistory3?: boolean;
    medicalHistory4?: boolean;
    medicalHistory5?: string[];
    medicalHistory6?: boolean;
    medicalHistory7?: string[];
    medicalHistory7Relation?: string;
    medicalHistory8?: boolean;
    medicalHistory9?: boolean;
    medicalHistory10?: boolean;
    medicalHistory11?: string;
    medicalHistory12?: boolean;
    medicalHistory13?: string;
    medicalHistory14?: string[];
    medicalHistory15?: string;
    medicalHistory16?: boolean;
    prescriptionsSupplements?: string;
    // Condition details
    medicalConditions?: string[];
    otherMedicalCondition?: string;
    medicinesTreatments?: string[];
    otherMedicalTreatments?: string;
  };
}): LegacyClientPayload {
  const phoneInfo = parsePhoneNumber(formData.personal.phone);
  const countryCode = toAlpha3(formData.address.country);
  const mh = formData.medicalHistory || {};
  
  // Map frontend condition values to exact API values
  const conditionToApiValue: Record<string, string> = {
    'adhd': 'adhd',
    'agoraphobia': 'agoraphobia',
    'anxiety': 'anxiety',
    'depression': 'depression',
    'tourettes': 'tourette_syndrome',
    'ptsd': 'post_traumatic_stress_disorder',
    'ocd': 'ocd',
    'chronic_pain': 'chronic_and_long_term_pain',
    'insomnia': 'sleep_disorders',
    'fibromyalgia': 'fibromyalgia',
    'migraines': 'migraine',
    'arthritis': 'arthritis',
    'other': 'other_medical_condition',
  };
  
  // Map frontend medication values to exact API values  
  const medicationToApiValue: Record<string, string> = {
    'venlafaxine': 'venlafaxine',
    'zolpidem': 'zolpidem',
    'zopiclone': 'zopiclone',
    'sertraline': 'sertraline',
    'fluoxetine': 'fluoxetine',
    'gabapentin': 'gabapentin',
    'pregabalin': 'gabapentin', // Map pregabalin to nearest option
    'amitriptyline': 'amitriptyline',
    'none': 'none',
  };
  
  // Map cannabis frequency to API values
  const frequencyToApiValue: Record<string, string> = {
    'Never': 'never',
    'Rarely': '1_2_times_per_week',
    'Occasionally': '1_2_times_per_week', 
    'Regularly': 'every_other_day',
    'Daily': 'everyday',
    'never': 'never',
    'everyday': 'everyday',
    'every_other_day': 'every_other_day',
    '1_2_times_per_week': '1_2_times_per_week',
  };
  
  // Map cannabis methods to API values
  const methodToApiValue: Record<string, string> = {
    'never': 'never',
    'smoking': 'smoking_joints',
    'vaping': 'vaporizing',
    'edibles': 'ingestion',
    'oils': 'ingestion',
    'topicals': 'topical',
    'smoking_joints': 'smoking_joints',
    'vaporizing': 'vaporizing',
    'ingestion': 'ingestion',
    'topical': 'topical',
  };
  
  // Transform conditions to API values
  const transformConditions = (conditions: string[] | undefined): string[] => {
    if (!conditions || conditions.length === 0) return [];
    return conditions
      .map(c => conditionToApiValue[c.toLowerCase()] || c.toLowerCase().replace(/\s+/g, '_'))
      .filter(Boolean);
  };
  
  // Transform medications to API values
  const transformMedications = (meds: string[] | undefined): string[] => {
    if (!meds || meds.length === 0) return [];
    return meds
      .map(m => medicationToApiValue[m.toLowerCase()] || m.toLowerCase())
      .filter(Boolean);
  };
  
  // Build medicalHistory5 (diagnosed conditions) - maps to API multi-select
  const diagnosedConditions = mh.medicalHistory5 || 
    (mh.psychosisHistory === 'yes' ? ['schizophrenia'] : ['none']);
  
  // Build medicalHistory14 (cannabis methods)
  const cannabisMethods = (mh.medicalHistory14 || ['never']).map(
    m => methodToApiValue[m] || m
  );
  
  const payload: LegacyClientPayload = {
    firstName: formData.personal.firstName.trim(),
    lastName: formData.personal.lastName.trim(),
    email: formData.personal.email.toLowerCase().trim(),
    phoneCode: phoneInfo.phoneCode,
    phoneCountryCode: phoneInfo.phoneCountryCode,
    contactNumber: phoneInfo.contactNumber,
    shipping: {
      address1: formData.address.street.trim(),
      address2: '', // Required by Dr. Green API - must be empty string, not omitted
      city: formData.address.city.trim(),
      state: formData.address.state?.trim() || formData.address.city.trim(),
      country: formData.address.country,
      countryCode: countryCode,
      postalCode: formData.address.postalCode.trim(),
    },
    medicalRecord: {
      dob: formData.personal.dateOfBirth, // Already in YYYY-MM-DD format
      gender: formData.personal.gender || 'prefer_not_to_say',
      // Required boolean flags - map from safety gates and individual fields
      medicalHistory0: mh.heartProblems === 'yes' || mh.medicalHistory0 === true,
      medicalHistory1: mh.medicalHistory1 === true,
      medicalHistory2: mh.medicalHistory2 === true,
      medicalHistory3: mh.medicalHistory3 === true,
      medicalHistory4: mh.psychosisHistory === 'yes' || mh.medicalHistory4 === true,
      medicalHistory5: diagnosedConditions.length > 0 ? diagnosedConditions : ['none'],
      medicalHistory6: mh.medicalHistory6 === true,
      medicalHistory7: mh.medicalHistory7 || ['none'],
      medicalHistory7Relation: mh.medicalHistory7Relation || 'none',
      medicalHistory8: mh.medicalHistory8 === true,
      medicalHistory9: mh.medicalHistory9 === true,
      medicalHistory10: mh.medicalHistory10 === true,
      medicalHistory11: mh.medicalHistory11 || '0',
      medicalHistory12: mh.medicalHistory12 === true,
      medicalHistory13: frequencyToApiValue[mh.medicalHistory13 || 'never'] || 'never',
      medicalHistory14: cannabisMethods.length > 0 ? cannabisMethods : ['never'],
      medicalHistory15: mh.medicalHistory15,
      medicalHistory16: mh.cannabisReaction === 'yes' || mh.medicalHistory16 === true,
    },
  };
  
  // Add optional medicalConditions (transformed from conditions array)
  const apiConditions = transformConditions(mh.conditions || mh.medicalConditions);
  if (apiConditions.length > 0) {
    payload.medicalRecord.medicalConditions = apiConditions;
  }
  
  // Add optional otherMedicalCondition
  if (mh.otherMedicalCondition?.trim()) {
    payload.medicalRecord.otherMedicalCondition = mh.otherMedicalCondition.trim();
  }
  
  // Add optional medicinesTreatments (transformed from medications array)
  const apiMedications = transformMedications(mh.medications || mh.medicinesTreatments);
  if (apiMedications.length > 0) {
    payload.medicalRecord.medicinesTreatments = apiMedications;
  }
  
  // Add optional otherMedicalTreatments
  if (mh.otherMedicalTreatments?.trim()) {
    payload.medicalRecord.otherMedicalTreatments = mh.otherMedicalTreatments.trim();
  }
  
  // Add optional prescriptionsSupplements
  if (mh.prescriptionsSupplements?.trim()) {
    payload.medicalRecord.prescriptionsSupplements = mh.prescriptionsSupplements.trim();
  }
  
  // Conditionally add clientBusiness if user selected "I am a business"
  if (formData.business?.isBusiness && formData.business.businessName) {
    const businessCountry = formData.business.businessCountryCode || formData.address.country;
    payload.clientBusiness = {
      businessType: formData.business.businessType || 'other',
      name: formData.business.businessName,
      address1: formData.business.businessAddress1 || '',
      address2: formData.business.businessAddress2,
      city: formData.business.businessCity || '',
      state: formData.business.businessState,
      country: businessCountry,
      countryCode: toAlpha3(businessCountry),
      postalCode: formData.business.businessPostalCode || '',
    };
  }
  
  return payload;
}

// Export all functions for use in components
export const drGreenApi = {
  // Client
  createClient,
  getClient,
  refreshClient,
  // Strains
  getStrains,
  getStrain,
  // Cart
  getCart,
  addToCart,
  removeFromCart,
  emptyCart,
  // Orders
  placeOrder,
  getOrder,
  getOrders,
  // Helpers
  parsePhoneNumber,
  buildLegacyClientPayload,
  toAlpha3,
};
