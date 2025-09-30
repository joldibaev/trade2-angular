/**
 * User entity interface
 * System users with authentication and authorization capabilities
 */
export interface User {
  /** Unique identifier (UUID v7) */
  id: string;

  /** Login username */
  username: string;

  /** User's first name */
  firstName?: string;

  /** User's last name */
  lastName?: string;

  /** Hashed password */
  password: string;

  /** Refresh token for token renewal */
  refreshToken?: string;

  /** Record creation date */
  createdAt: Date;

  /** Last update date */
  updatedAt: Date;
}

/**
 * User creation DTO (without id, createdAt, updatedAt)
 */
export interface CreateUserDto {
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * User update DTO (all fields optional)
 */
export type UpdateUserDto = Partial<CreateUserDto>;
