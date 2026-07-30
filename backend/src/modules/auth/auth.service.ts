// backend/src/modules/auth/auth.service.ts — новая логика refresh

export class AuthService {
  /**
   * Refresh с ротацией — старый токен инвалидируем, выдаём новый.
   * Если старый токен уже использован — это признак кражи токена.
   * Отзываем ВСЕ токены пользователя (защита от replay attack).
   */
  async refreshTokens(oldRefreshToken: string) {
    // 1. Находим токен в БД
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: oldRefreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // 2. Токен уже отозван — возможная кража, инвалидируем все сессии
    if (storedToken.revokedAt) {
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedError('Refresh token reuse detected — all sessions revoked');
    }

    // 3. Проверяем срок жизни
    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired');
    }

    // 4. Отзываем старый токен
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // 5. Выдаём новую пару токенов
    return this.generateTokenPair(storedToken.user);
  }

  private async generateTokenPair(user: { id: string; email: string; role: Role }) {
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    const refreshTokenValue = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Сохраняем хэш refresh token в БД (не сам токен)
    await prisma.refreshToken.create({
      data: {
        token: await bcrypt.hash(refreshTokenValue, 10),
        userId: user.id,
        expiresAt,
      },
    });

    return { accessToken, refreshToken: refreshTokenValue };
  }

  /**
   * Logout — отзываем конкретный refresh token (один девайс)
   * или все токены пользователя (все девайсы)
   */
  async logout(userId: string, refreshToken: string, allDevices = false) {
    if (allDevices) {
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } else {
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }
}
