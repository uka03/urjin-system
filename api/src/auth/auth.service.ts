import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UserService } from 'user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ref } from 'process';
import { JwtPayload, RefreshTokenPayload } from './types/jwt-payload.type';
import { DateHelper } from 'common/helpers/date.helper';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,

    private readonly configService: ConfigService,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    const { password, name, email, ...restUserData } = createAuthDto;

    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    try {
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          ...restUserData,
          passwordHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already in use');
      }
      throw error;
    }
  }

  async login(loginAuthDto: LoginAuthDto) {
    const { email, password } = loginAuthDto;

    const user = await this.userService.findByEmailForAuth(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new NotFoundException('Invalid password');
    }

    const session = await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const { accessToken, refreshToken } = await this.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      sid: session.id,
    });

    const tokenHash = await bcrypt.hash(refreshToken, this.SALT_ROUNDS);

    await this.prisma.refreshToken.update({
      where: { id: session.id },
      data: { tokenHash },
    });

    return {
      refreshToken,
      data: {
        accessToken,
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  private async generateAccessToken(user: {
    id: string;
    email: string;
    role: string;
    sid: string;
  }) {
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      sid: user.sid,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Хэрэглэгч олдсонгүй эсвэл идэвхгүй байна',
      );
    }

    return user;
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.prisma.refreshToken.findUnique({
      where: { id: payload.sid },
      select: {
        user: true,
        userId: true,
        expiresAt: true,
        tokenHash: true,
        id: true,
      },
    });

    if (!session || !session.user) {
      throw new UnauthorizedException('Invalid refresh token session');
    }

    const user = session.user;

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    const isTokenValid = bcrypt.compare(refreshToken, session.tokenHash ?? '');

    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: session.id },
      data: { expiresAt: new Date(Date.now()) },
    });

    const newSession = await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
        sid: newSession.id,
      });

    const tokenHash = await bcrypt.hash(newRefreshToken, this.SALT_ROUNDS);

    await this.prisma.refreshToken.update({
      where: { id: newSession.id },
      data: { tokenHash },
    });

    return {
      refreshToken: newRefreshToken,
      data: {
        accessToken,
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async logout(refreshToken: string) {
    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    await this.prisma.refreshToken.update({
      where: { id: payload.sid },
      data: {
        revokedAt: DateHelper.nowUTC(),
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
