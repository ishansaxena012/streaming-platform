import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto/register.dto';
import { LoginDto } from './dto/login.dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ description: 'User successfully registered.' })
  @ApiBadRequestResponse({ description: 'Invalid register data.' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Log in an existing user' })
  @ApiOkResponse({ description: 'User successfully logged in.' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password.' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Sign in / Sign up with Google OAuth token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'google-oauth-token-xyz' },
      },
      required: ['token'],
    },
  })
  @ApiOkResponse({ description: 'Successfully authenticated with Google.' })
  @ApiUnauthorizedResponse({ description: 'Invalid Google token.' })
  @Post('google')
  googleSignIn(@Body('token') token: string) {
    return this.authService.googleSignIn(token);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ description: 'Profile successfully retrieved.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    return this.authService.getCurrentUser(req.user.id);
  }
}
