import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'API Root Health Check' })
  @ApiOkResponse({ description: 'Returns welcome/health message.' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
