import { Controller, Post, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';
import Stripe from 'stripe';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import {
  AuthUser,
  PreAuthorize,
} from '@core-service/decorators/auth.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { EUserRole } from '../user/enums/user-role.enum';
import { User } from '../user/entities/user.entity';
import { BuyCreditsDto } from './dtos/buy-credit.dto';

@Controller('payment')
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // Handle Stripe Webhook Events
  @Post('webhook')
  @Public()
  async handleWebhook(@Req() req, @Res() res) {
    const event = await this.paymentService.validateWebhookEvent(req);

    if (!event) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Webhook validation failed');
    }

    await this.paymentService.handleWebhookEvent(event);
    return res.sendStatus(HttpStatus.OK);
  }

  // Endpoint to initiate credit purchase
  @Post('buy-credits')
  @ApiOperation({ summary: 'Purchase credits for students' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        credits: { type: 'number', example: 10 },
      },
    },
  })
  @AuthUser()
  @PreAuthorize(EUserRole.STUDENT)
  async buyCredits(@Body() body: BuyCreditsDto, @Req() req) {
    const { credits } = body;

    if (!credits || credits < 1) {
      return { error: 'Invalid request' };
    }

    const session = await this.paymentService.createCheckoutSession(
      req.user as User,
      credits,
    );
    return session;
  }
}
