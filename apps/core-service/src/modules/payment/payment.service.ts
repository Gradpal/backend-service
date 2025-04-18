import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Student } from '../student/entities/student.entity';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import { Payment } from './entities/payment.entity';
import { EPaymentType } from './enums/payment-type.enum';
import { User } from '../user/entities/user.entity';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _400 } from '@app/common/constants/errors-constants';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly configService: CoreServiceConfigService,
    private readonly exceptionHandler: ExceptionHandler,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {
    const stripeKey = this.configService.getStripeSecretKey;
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createCheckoutSession(user: User, credits: number) {
    const student = await this.studentRepository.findOne({
      where: {
        profile: {
          id: user.id,
        },
      },
      relations: ['profile'],
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const session = await this.stripe.checkout.sessions.create({
      customer_email: student.profile.email, // Ensure the Student entity has an email field
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
      success_url: `${this.configService.clientUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.clientUrl}/payment-failed`,
      metadata: {
        studentId: student.id,
        credits,
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

      const student = await this.studentRepository.findOne({
        where: { id: studentId },
        relations: ['profile'],
      });
      if (!student) return;

      student.credits += credits; // Add purchased credits
      await this.studentRepository.save(student);

      // Record payment in the database
      const payment = this.paymentRepository.create({
        user: student.profile, // Assuming Student extends User
        amount,
        currency: session.currency || 'USD',
        stripe_checkout_session_id: session.id,
        payment_type: EPaymentType.CREDITS_PURCHASE,
      });

      await this.paymentRepository.save(payment);
    }
  }

  async validateWebhookEvent(req: any): Promise<Stripe.Event | null> {
    return req.body;
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
      console.log('error', error);
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
          refresh_url: `${this.configService.clientUrl}/stripe/refresh`,
          return_url: `${this.configService.clientUrl}/stripe/return`,
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
