/**
 * Authentication interfaces
 * Login and token refresh DTOs
 */

/**
 * Login DTO for user authentication
 */
export interface LoginDto {
  /** Username for authentication */
  username: string;

  /** Password for authentication */
  password: string;
}

/**
 * Refresh token DTO for token renewal
 */
export interface RefreshTokenDto {
  /** Refresh token for access token renewal */
  refresh_token: string;
}

/**
 * Authentication response interface
 */
export interface AuthResponse {
  /** Access token */
  access_token: string;

  /** Refresh token */
  refresh_token: string;

  /** User information */
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}
