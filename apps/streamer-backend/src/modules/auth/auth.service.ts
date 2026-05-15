import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto/register.dto';
import { LoginDto } from './dto/login.dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

    console.log('🚀 Google Client ID Loaded:', clientId ? 'SUCCESS' : 'FAILED');
    console.log(
      '🚀 Google Client Secret Loaded:',
      clientSecret ? 'SUCCESS' : 'FAILED',
    );

    this.googleClient = new OAuth2Client(clientId);
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.createUser({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
    });

    const token = await this.generateToken(user);

    return {
      message: 'User registered successfully',
      user,
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    const token = await this.generateToken(safeUser);

    return {
      message: 'Login successful',
      user: safeUser,
      token,
    };
  }

  async googleSignIn(token: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token payload');
      }

      let user = await this.usersService.findByEmail(payload.email);

      if (!user) {
        user = (await this.usersService.createUser({
          name: payload.name || 'Google User',
          email: payload.email,
          googleId: payload.sub,
          avatarUrl: payload.picture,
        })) as any;
      }

      if (!user) {
        throw new UnauthorizedException('Could not create or find user');
      }

      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        avatarUrl: user.avatarUrl,
      };

      const jwtToken = await this.generateToken(safeUser);

      return {
        message: 'Google Sign-In successful',
        user: safeUser,
        token: jwtToken,
      };
    } catch (error) {
      console.error('Google Sign-In error:', error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  private async generateToken(user: {
    id: string;
    email: string;
    role: string;
  }) {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
