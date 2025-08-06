import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import { Payment } from './entities/payment.entity';
import { EPaymentType } from './enums/payment-type.enum';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _400, _404 } from '@app/common/constants/errors-constants';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private readonly configService: CoreServiceConfigService,
    private readonly exceptionHandler: ExceptionHandler,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly userService: UserService,
  ) {
    const stripeKey = this.configService.getStripeSecretKey;
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createCheckoutSession(student: User, credits: number) {
    const session = await this.stripe.checkout.sessions.create({
      customer_email: student.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'USD',
            product_data: {
              name: `Purchase ${credits} Credits`,
            },
            unit_amount: credits * 100, // 1 credit = $1
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        studentId: student.id,
        credits,
      },
      redirect_on_completion: 'if_required',
      ui_mode: 'embedded',
      after_expiration: {
        recovery: {
          enabled: true,
        },
      },
      automatic_tax: {
        enabled: true,
      },
      tax_id_collection: {
        enabled: true,
      },
    });

    return session;
  }
  async createCheckoutSessionByParent(studentId: string, credits: number) {
    const student = await this.userService.findOne(studentId);
    if (!student) {
      this.exceptionHandler.throwNotFound(_404.USER_NOT_FOUND);
    }

    const session = await this.stripe.checkout.sessions.create({
      customer_email: student.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'USD',
            product_data: {
              name: `Purchase ${credits} Credits`,
            },
            unit_amount: credits * 100, // 1 credit = $1
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        studentId: student.id,
        credits,
      },
      redirect_on_completion: 'if_required',
      ui_mode: 'embedded',
      after_expiration: {
        recovery: {
          enabled: true,
        },
      },
      automatic_tax: {
        enabled: true,
      },
      tax_id_collection: {
        enabled: true,
      },
    });

    return session;
  }

  async handleWebhookEvent(event: Stripe.Event) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const studentId = session.metadata?.studentId;
      const credits = Number(session.metadata?.credits);
      const amount = Number(session.amount_total) / 100;
      if (!studentId || !credits) return;

      const student = await this.userService.findOne(studentId);
      if (!student) return;

      student.credits += credits;
      await this.userService.save(student);

      const payment = this.paymentRepository.create({
        user: student,
        amount,
        currency: session.currency || 'USD',
        stripe_checkout_session_id: session.id,
        payment_type: EPaymentType.CREDITS_PURCHASE,
      });

      await this.paymentRepository.save(payment);
    }
  }

  async validateWebhookEvent(req: any): Promise<Stripe.Event | null> {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = this.configService.getStripeWebsookSecret;
    try {
      return this.stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook Error:', err.message);
      return null;
    }
  }

  async createStripeAccount(user: User): Promise<string> {
    try {
      const params: Stripe.AccountCreateParams = {
        type: 'express',
        email: user.email,
        individual: {
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.email,
        },
        settings: {
          payouts: {
            schedule: {
              interval: 'manual' as const,
            },
          },
        },
        business_type: 'individual',
      };
      const account = await this.stripe.accounts.create(params);
      return account.id;
    } catch (error) {
      this.exceptionHandler.throwBadRequest(
        _400.STRIPE_ACCOUNT_CREATION_FAILED,
      );
    }
  }

  async checkPaymentCapability(stripeAccountId: string): Promise<{
    canProceedPayments: boolean;
    accountLink?: string;
    loginLink?: string;
  }> {
    try {
      const account = await this.stripe.accounts.retrieve(stripeAccountId);
      const requirements = account.requirements;

      if (
        requirements.currently_due.length !== 0 &&
        requirements.disabled_reason
      ) {
        const accountLink = await this.stripe.accountLinks.create({
          account: stripeAccountId,
          refresh_url: `${this.configService.clientUrl}/tutor/account-setup`,
          return_url: `${this.configService.clientUrl}/tutor/account-setup`,
          type: 'account_onboarding',
        });

        return {
          canProceedPayments: false,
          accountLink: accountLink.url,
        };
      }

      const loginLink =
        await this.stripe.accounts.createLoginLink(stripeAccountId);

      return {
        canProceedPayments: true,
        loginLink: loginLink.url,
      };
    } catch (error) {
      this.exceptionHandler.throwBadRequest(
        _400.STRIPE_ACCOUNT_RETRIEVAL_FAILED,
      );
    }
  }

  async makeTransfer(transferInfo: {
    amount: number;
    currency: string;
    recipientStripeAccountId: string;
    metadata?: Record<string, any>;
    transferGroup?: string;
  }) {
    const {
      amount,
      currency,
      recipientStripeAccountId,
      metadata,
      transferGroup,
    } = transferInfo;

    const transfer = await this.stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents and round to 3 decimals
      currency: currency,
      destination: recipientStripeAccountId,
      transfer_group: transferGroup,
      metadata: {
        ...metadata,
        transaction_scope: this.configService.environment,
      },
    });
    return transfer;
  }

  async markSessionAsComplete(
    sessionId: string,
    recipientStripeAccountId: string,
  ) {
    const amount = 10; // 10 EUR
    const currency = 'eur';

    const transfer = await this.makeTransfer({
      amount,
      currency,
      recipientStripeAccountId,
      metadata: {
        // sessionId,
        // type: 'session_completion',
      },
      // transferGroup: `session_${sessionId}`,
    });

    return transfer;
  }
}
