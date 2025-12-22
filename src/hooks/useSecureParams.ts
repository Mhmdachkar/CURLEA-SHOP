import { useParams, useSearchParams } from 'react-router-dom';
import { sanitizeProductId, sanitizeCategory, sanitizeUrlParam } from '@/utils/securityEnhanced';

/**
 * Secure hook for URL parameters
 * Automatically sanitizes all URL parameters to prevent injection attacks
 */
export const useSecureParams = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();

  // Sanitize all params
  const sanitizedParams: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      switch (key) {
        case 'id':
          sanitizedParams[key] = sanitizeProductId(value);
          break;
        case 'category':
          sanitizedParams[key] = sanitizeCategory(value);
          break;
        default:
          sanitizedParams[key] = sanitizeUrlParam(value);
      }
    } else {
      sanitizedParams[key] = null;
    }
  }

  // Sanitize search params
  const sanitizedSearchParams = new URLSearchParams();
  for (const [key, value] of searchParams.entries()) {
    const sanitizedKey = sanitizeUrlParam(key);
    const sanitizedValue = sanitizeUrlParam(value);
    if (sanitizedKey && sanitizedValue) {
      sanitizedSearchParams.set(sanitizedKey, sanitizedValue);
    }
  }

  return {
    params: sanitizedParams,
    searchParams: sanitizedSearchParams,
  };
};

