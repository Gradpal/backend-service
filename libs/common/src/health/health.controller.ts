import { Public } from '@app/common/decorators/public.decorator';
import { Controller, Get } from '@nestjs/common';

@Controller('/health')
@Public()
export class HealthController {
  @Get()
  health() {
    return true;
  }
}
