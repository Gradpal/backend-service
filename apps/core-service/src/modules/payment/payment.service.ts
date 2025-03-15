import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Student } from '../student/entities/student.entity';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import { Payment } from './entities/payment.entity';
import { EPaymentType } from './enums/payment-type.enum';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly configService: CoreServiceConfigService,
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
        user: {
          id: user.id,
        },
      },
      relations: ['user'],
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const session = await this.stripe.checkout.sessions.create({
      customer_email: student.user.email, // Ensure the Student entity has an email field
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
        relations: ['user'],
      });
      if (!student) return;

      student.credits += credits; // Add purchased credits
      await this.studentRepository.save(student);

      // Record payment in the database
      const payment = this.paymentRepository.create({
        user: student.user, // Assuming Student extends User
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
}
