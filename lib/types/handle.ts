export interface HandleSetupForm {
  handle: string;
}

export interface HandleValidationResult {
  isValid: boolean;
  message?: string;
}

export interface HandleUpdateResponse {
  success: boolean;
  message: string;
  handle?: string;
}
