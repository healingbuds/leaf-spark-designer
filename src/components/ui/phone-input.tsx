import * as React from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  normalizePhoneNumber, 
  getCallingCode, 
  getPhoneFormatHint,
  COUNTRY_CALLING_CODES 
} from "@/lib/phoneNormalization";

export interface PhoneValidationState {
  isValid: boolean;
  isPartiallyValid: boolean;
  message: string | null;
  digitsEntered: number;
  digitsRequired: number;
}

export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  countryCode: string;
  onValidationChange?: (state: PhoneValidationState) => void;
  showValidation?: boolean;
}

/**
 * Validates phone number in real-time and returns detailed feedback
 */
export function validatePhoneRealtime(
  rawPhone: string,
  countryAlpha2: string
): PhoneValidationState {
  // Remove all non-digits for counting
  const digitsOnly = rawPhone.replace(/\D/g, '');
  const countryData = COUNTRY_CALLING_CODES[countryAlpha2.toUpperCase()];
  
  if (!countryData) {
    return {
      isValid: false,
      isPartiallyValid: false,
      message: "Invalid country",
      digitsEntered: digitsOnly.length,
      digitsRequired: 9,
    };
  }

  const digitsRequired = countryData.minNationalLength;
  const maxDigits = countryData.maxNationalLength;
  
  // Not enough input to validate yet
  if (digitsOnly.length < 3) {
    return {
      isValid: false,
      isPartiallyValid: true,
      message: null,
      digitsEntered: digitsOnly.length,
      digitsRequired,
    };
  }

  // Try to normalize
  const result = normalizePhoneNumber(rawPhone, countryAlpha2);
  
  if (result.success) {
    return {
      isValid: true,
      isPartiallyValid: true,
      message: null,
      digitsEntered: result.contactNumber.length,
      digitsRequired,
    };
  }

  // Determine specific error message
  const digitsEntered = digitsOnly.length;
  
  if (result.code === 'TOO_SHORT') {
    const needed = digitsRequired - digitsEntered;
    return {
      isValid: false,
      isPartiallyValid: true,
      message: needed === 1 
        ? `1 more digit needed` 
        : `${needed} more digits needed`,
      digitsEntered,
      digitsRequired,
    };
  }
  
  if (result.code === 'TOO_LONG') {
    const excess = digitsEntered - maxDigits;
    return {
      isValid: false,
      isPartiallyValid: false,
      message: excess === 1 
        ? `Remove 1 digit` 
        : `Remove ${excess} digits`,
      digitsEntered,
      digitsRequired,
    };
  }

  return {
    isValid: false,
    isPartiallyValid: false,
    message: result.error || "Invalid format",
    digitsEntered,
    digitsRequired,
  };
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, countryCode, onValidationChange, showValidation = true, ...props }, ref) => {
    const [validationState, setValidationState] = React.useState<PhoneValidationState>({
      isValid: false,
      isPartiallyValid: true,
      message: null,
      digitsEntered: 0,
      digitsRequired: 9,
    });
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasInteracted, setHasInteracted] = React.useState(false);

    const callingCode = getCallingCode(countryCode);
    const placeholder = getPhoneFormatHint(countryCode);

    // Validate on value change with debounce
    React.useEffect(() => {
      if (!value || value.length < 3) {
        setValidationState({
          isValid: false,
          isPartiallyValid: true,
          message: null,
          digitsEntered: value?.replace(/\D/g, '').length || 0,
          digitsRequired: COUNTRY_CALLING_CODES[countryCode]?.minNationalLength || 9,
        });
        return;
      }

      const timer = setTimeout(() => {
        const state = validatePhoneRealtime(value, countryCode);
        setValidationState(state);
        onValidationChange?.(state);
      }, 300);

      return () => clearTimeout(timer);
    }, [value, countryCode, onValidationChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasInteracted(true);
      onChange(e.target.value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      // Normalize to E.164 on blur if valid
      if (value && !value.startsWith('+')) {
        const result = normalizePhoneNumber(value, countryCode);
        if (result.success && result.e164 !== value) {
          onChange(result.e164);
        }
      }
      props.onBlur?.(e);
    };

    const showStatus = showValidation && hasInteracted && value && value.length >= 3;
    const showError = showStatus && !validationState.isValid && !validationState.isPartiallyValid;
    const showPartialHint = showStatus && !validationState.isValid && validationState.isPartiallyValid && validationState.message;
    const showSuccess = showStatus && validationState.isValid;

    return (
      <div className="relative">
        <div className="flex">
          {/* Calling code prefix */}
          <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm font-medium min-w-[60px] justify-center">
            {callingCode}
          </div>
          
          {/* Phone input */}
          <div className="relative flex-1">
            <Input
              ref={ref}
              type="tel"
              inputMode="numeric"
              value={value}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={handleBlur}
              placeholder={placeholder}
              className={cn(
                "rounded-l-none pr-10",
                showSuccess && "border-green-500 focus-visible:ring-green-500",
                showError && "border-destructive focus-visible:ring-destructive",
                showPartialHint && "border-amber-500 focus-visible:ring-amber-500",
                className
              )}
              {...props}
            />
            
            {/* Validation icon */}
            {showStatus && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {showSuccess && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {showError && (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
                {showPartialHint && !showSuccess && !showError && (
                  <div className="text-xs text-amber-600 font-medium">
                    {validationState.digitsEntered}/{validationState.digitsRequired}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Validation message */}
        {showValidation && validationState.message && hasInteracted && value.length >= 3 && (
          <p className={cn(
            "text-xs mt-1.5 flex items-center gap-1",
            showError && "text-destructive",
            showPartialHint && "text-amber-600"
          )}>
            {showError && <AlertCircle className="h-3 w-3" />}
            {validationState.message}
          </p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
