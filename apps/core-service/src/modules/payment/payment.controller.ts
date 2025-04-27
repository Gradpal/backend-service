import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  HttpStatus,
  Get,
} from '@nestjs/common';
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
  // @PreAuthorize(EUserRole.STUDENT)
  @AuthUser()
  async buyCredits(
    @Body() body: BuyCreditsDto,
    @Req() req,
  ): Promise<Stripe.Checkout.Session | { error: string }> {
    return this.paymentService.createCheckoutSession(
      req.user as User,
      body.credits,
    );
  }

  @Post('create')
  @PreAuthorize(EUserRole.TUTOR)
  @ApiOperation({ summary: 'Create a new Stripe account for the user' })
  async createStripeAccount(@Req() user: User) {
    const stripeAccountId = await this.paymentService.createStripeAccount(user);
    return { stripeAccountId };
  }

  @Get('status')
  @PreAuthorize(EUserRole.TUTOR)
  @ApiOperation({ summary: 'Check if user can proceed with payments' })
  async checkPaymentCapability(@Req() req) {
    console.log('checkPaymentCapability-------------->');
    const user: User = req.user as User;
    if (!user.stripeAccountId) {
      return { canProceedPayments: false, message: 'No Stripe account found' };
    }
    return await this.paymentService.checkPaymentCapability(user.stripeAccountId);
  }

  @Post('session/complete')
  @ApiOperation({ summary: 'Mark a session as complete and transfer payment' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
        recipientStripeAccountId: { type: 'string' },
      },
    },
  })
  async markSessionAsComplete(
    @Body() body: { sessionId: string; recipientStripeAccountId: string },
  ) {
    const { sessionId, recipientStripeAccountId } = body;
    return this.paymentService.markSessionAsComplete(
      sessionId,
      recipientStripeAccountId,
    );
  }
}
