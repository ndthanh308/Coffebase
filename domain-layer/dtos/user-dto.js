/**
 * User Data Transfer Object
 * Used for API request/response formatting
 */

export class UserDTO {
  static toResponse(user) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      creditPoints: user.credit_points,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  static toSafeResponse(user) {
    // Remove sensitive data
    const safeUser = this.toResponse(user);
    delete safeUser.password;
    return safeUser;
  }
}

