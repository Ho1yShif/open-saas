import Stripe from "stripe";
import { User } from "wasp/entities";
/**
 * Returns a Stripe customer for the given User email, creating a customer if none exist.
 * Implements email uniqueness logic since Stripe doesn't enforce unique emails.
 */
export declare function ensureStripeCustomer(userEmail: NonNullable<User["email"]>): Promise<Stripe.Customer>;
interface CreateStripeCheckoutSessionParams {
    priceId: Stripe.Price["id"];
    customerId: Stripe.Customer["id"];
    mode: Stripe.Checkout.Session.Mode;
}
export declare function createStripeCheckoutSession({ priceId, customerId, mode, }: CreateStripeCheckoutSessionParams): Promise<Stripe.Checkout.Session>;
export {};
//# sourceMappingURL=checkoutUtils.d.ts.map