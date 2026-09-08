export interface JwtPayload {
  sub: string; // User ID (Prisma эсвэл DB дээрх id)
  email: string; // Хэрэглэгчийн e-mail
  role?: string; // Хэрэв хэрэглэгчийн эрх/role байгаа бол (Заавал биш: ?)

  iat?: number; // Issued At (Үүсгэсэн хугацаа)
  exp?: number; // Expiration (Дуусах хугацаа)
}

export interface RefreshTokenPayload {
  sub: string; // User ID (Prisma эсвэл DB дээрх id)
  sid: string; // Session ID (Refresh Token session-ийн ID)
}
