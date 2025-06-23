import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FinanceService } from './finance.service';

@Controller('finance')
@ApiTags('Finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}
}
