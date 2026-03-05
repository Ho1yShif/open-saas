import { type MiddlewareConfigFn } from "wasp/server";
import { type PaymentsWebhook } from "wasp/server/api";
/**
 * Stripe requires a raw request to construct events successfully.
 */
export declare const stripeMiddlewareConfigFn: MiddlewareConfigFn;
export declare const stripeWebhook: PaymentsWebhook;
//# sourceMappingURL=webhook.d.ts.map