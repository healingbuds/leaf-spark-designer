/**
 * Canonical E.164 Phone Normalization Utility
 * 
 * This module provides deterministic, defense-in-depth phone number normalization
 * for the Dr. Green API, which requires strict E.164 format for First AML compliance.
 * 
 * Design principle: "Assume all data is bad" - treat every input as untrusted
 * and normalize/validate before sending to API.
 */

// Supported country calling codes with their metadata
// Listed from longest to shortest for proper prefix matching
export const COUNTRY_CALLING_CODES: Record<string, {
  callingCode: string;
  alpha2: string;
  alpha3: string;
  name: string;
  minNationalLength: number;
  maxNationalLength: number;
}> = {
  // Listed in priority order for lookup
  PT: { callingCode: '+351', alpha2: 'PT', alpha3: 'PRT', name: 'Portugal', minNationalLength: 9, maxNationalLength: 9 },
  GB: { callingCode: '+44', alpha2: 'GB', alpha3: 'GBR', name: 'United Kingdom', minNationalLength: 10, maxNationalLength: 10 },
  ZA: { callingCode: '+27', alpha2: 'ZA', alpha3: 'ZAF', name: 'South Africa', minNationalLength: 9, maxNationalLength: 9 },
  TH: { callingCode: '+66', alpha2: 'TH', alpha3: 'THA', name: 'Thailand', minNationalLength: 9, maxNationalLength: 9 },
  US: { callingCode: '+1', alpha2: 'US', alpha3: 'USA', name: 'United States', minNationalLength: 10, maxNationalLength: 10 },
};

// Reverse lookup: calling code (without +) -> country data
const CALLING_CODE_TO_COUNTRY: Record<string, typeof COUNTRY_CALLING_CODES[keyof typeof COUNTRY_CALLING_CODES]> = {};
Object.values(COUNTRY_CALLING_CODES).forEach(country => {
  const code = country.callingCode.replace('+', '');
  CALLING_CODE_TO_COUNTRY[code] = country;
});

// Sorted calling codes by length (longest first) for prefix matching
const SORTED_CALLING_CODES = Object.values(COUNTRY_CALLING_CODES)
  .map(c => c.callingCode.replace('+', ''))
  .sort((a, b) => b.length - a.length);

export interface PhoneNormalizationResult {
  success: true;
  e164: string;           // Full E.164 format: +351912345678
  phoneCode: string;      // Just the calling code with +: +351
  contactNumber: string;  // Just the national number, digits only: 912345678
  phoneCountryCode: string; // Alpha-2 country code: PT
}

export interface PhoneNormalizationError {
  success: false;
  error: string;
  code: 'INVALID_INPUT' | 'TOO_SHORT' | 'TOO_LONG' | 'INVALID_FORMAT' | 'COUNTRY_MISMATCH';
}

export type PhoneNormalizationOutput = PhoneNormalizationResult | PhoneNormalizationError;

/**
 * Normalize a raw phone input to E.164 format.
 * 
 * @param rawPhone - User input (may contain spaces, parentheses, leading 0, etc.)
 * @param selectedCountryAlpha2 - The country the user selected (PT, GB, ZA, TH, US)
 * @returns Normalized phone data or error
 */
export function normalizePhoneNumber(
  rawPhone: string | undefined | null,
  selectedCountryAlpha2: string
): PhoneNormalizationOutput {
  // Input validation
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { success: false, error: 'Phone number is required', code: 'INVALID_INPUT' };
  }

  const countryData = COUNTRY_CALLING_CODES[selectedCountryAlpha2.toUpperCase()];
  if (!countryData) {
    // Fallback to PT if unknown country
    return normalizePhoneNumber(rawPhone, 'PT');
  }

  // Step 1: Strip all non-digit characters except leading +
  let cleaned = rawPhone.trim();
  const hasPlus = cleaned.startsWith('+');
  
  // Remove everything except digits
  cleaned = cleaned.replace(/\D/g, '');
  
  if (cleaned.length === 0) {
    return { success: false, error: 'Phone number contains no digits', code: 'INVALID_INPUT' };
  }

  let nationalNumber: string;
  let detectedCountry = countryData;

  if (hasPlus) {
    // Input had a + prefix - try to detect calling code
    const matchedCode = findCallingCodePrefix(cleaned);
    
    if (matchedCode) {
      detectedCountry = CALLING_CODE_TO_COUNTRY[matchedCode];
      nationalNumber = cleaned.slice(matchedCode.length);
    } else {
      // Unknown calling code - assume digits are national number and use selected country
      nationalNumber = cleaned;
    }
  } else {
    // No + prefix - treat as local/national number
    nationalNumber = cleaned;
  }

  // Step 2: Remove leading trunk zeros (common in local formats like 0912345678 -> 912345678)
  // But be careful not to remove too many zeros
  while (nationalNumber.startsWith('0') && nationalNumber.length > detectedCountry.minNationalLength) {
    nationalNumber = nationalNumber.slice(1);
  }

  // Step 3: Validate national number length
  if (nationalNumber.length < detectedCountry.minNationalLength) {
    return { 
      success: false, 
      error: `Phone number too short for ${detectedCountry.name}. Expected at least ${detectedCountry.minNationalLength} digits.`,
      code: 'TOO_SHORT'
    };
  }

  if (nationalNumber.length > detectedCountry.maxNationalLength) {
    // Try trimming from the left in case there's still a calling code embedded
    const expectedLength = detectedCountry.minNationalLength;
    if (nationalNumber.length > expectedLength) {
      // Check if the excess digits match the calling code
      const callingDigits = detectedCountry.callingCode.replace('+', '');
      if (nationalNumber.startsWith(callingDigits)) {
        nationalNumber = nationalNumber.slice(callingDigits.length);
      }
    }
    
    // Re-check after trimming
    if (nationalNumber.length > detectedCountry.maxNationalLength) {
      return { 
        success: false, 
        error: `Phone number too long for ${detectedCountry.name}. Expected at most ${detectedCountry.maxNationalLength} digits.`,
        code: 'TOO_LONG'
      };
    }
  }

  // Step 4: Build E.164
  const e164 = `${detectedCountry.callingCode}${nationalNumber}`;
  
  // Step 5: Final E.164 validation (ITU-T E.164: max 15 digits total)
  const e164Digits = e164.replace(/\D/g, '');
  if (e164Digits.length < 6 || e164Digits.length > 15) {
    return { 
      success: false, 
      error: 'Invalid phone number format',
      code: 'INVALID_FORMAT'
    };
  }

  return {
    success: true,
    e164,
    phoneCode: detectedCountry.callingCode,
    contactNumber: nationalNumber,
    phoneCountryCode: detectedCountry.alpha2,
  };
}

/**
 * Find the calling code prefix in a string of digits.
 * Uses longest-prefix matching to avoid false positives.
 */
function findCallingCodePrefix(digits: string): string | null {
  for (const code of SORTED_CALLING_CODES) {
    if (digits.startsWith(code)) {
      return code;
    }
  }
  return null;
}

/**
 * Format a phone number for display (not for API submission).
 * Returns a human-readable format.
 */
export function formatPhoneForDisplay(e164: string): string {
  // Basic formatting: +351 912 345 678
  if (!e164.startsWith('+')) return e164;
  
  const result = normalizePhoneNumber(e164, 'PT'); // Country doesn't matter for parsing
  if (!result.success) return e164;
  
  const { phoneCode, contactNumber } = result;
  
  // Format national number in groups of 3
  const formatted = contactNumber.replace(/(\d{3})(?=\d)/g, '$1 ');
  
  return `${phoneCode} ${formatted}`.trim();
}

/**
 * Validate a phone number without normalizing.
 * Returns true if the number can be normalized successfully.
 */
export function isValidPhoneNumber(rawPhone: string, countryAlpha2: string): boolean {
  const result = normalizePhoneNumber(rawPhone, countryAlpha2);
  return result.success;
}

/**
 * Get the expected phone format hint for a country.
 * Returns a placeholder example for the phone input.
 */
export function getPhoneFormatHint(countryAlpha2: string): string {
  const hints: Record<string, string> = {
    PT: '912 345 678',
    GB: '7911 123456',
    ZA: '71 234 5678',
    TH: '81 234 5678',
    US: '(555) 123-4567',
  };
  return hints[countryAlpha2.toUpperCase()] || 'Enter your phone number';
}

/**
 * Get the calling code for display purposes.
 */
export function getCallingCode(countryAlpha2: string): string {
  const country = COUNTRY_CALLING_CODES[countryAlpha2.toUpperCase()];
  return country?.callingCode || '+351';
}

/**
 * Alpha-3 to Alpha-2 country code conversion
 */
export function alpha3ToAlpha2(alpha3: string): string {
  const map: Record<string, string> = {
    PRT: 'PT',
    GBR: 'GB',
    ZAF: 'ZA',
    THA: 'TH',
    USA: 'US',
  };
  return map[alpha3.toUpperCase()] || 'PT';
}

/**
 * Alpha-2 to Alpha-3 country code conversion
 */
export function alpha2ToAlpha3(alpha2: string): string {
  const country = COUNTRY_CALLING_CODES[alpha2.toUpperCase()];
  return country?.alpha3 || 'PRT';
}
