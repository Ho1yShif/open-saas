import { Checkout } from "@polar-sh/sdk/models/components/checkout.js";
import { Customer } from "@polar-sh/sdk/models/components/customer.js";
/**
 * Returns a Polar customer for the given User email, creating a customer if none exist.
 *
 * NOTE: Polar enforces unique emails and `externalId`.
 *       Additionally, `externalId` can't be changed once set.
 */
export declare function ensurePolarCustomer(userId: string, userEmail: string): Promise<Customer>;
interface CreatePolarCheckoutSessionArgs {
    productId: string;
    customerId: string;
}
export declare function createPolarCheckoutSession({ productId, customerId, }: CreatePolarCheckoutSessionArgs): Promise<Checkout>;
export {};
//# sourceMappingURL=checkoutUtils.d.ts.map