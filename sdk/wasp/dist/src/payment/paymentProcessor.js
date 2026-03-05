import { stripePaymentProcessor } from "./stripe/paymentProcessor";
/**
 * Choose which payment processor you'd like to use, then delete the
 * other payment processor code that you're not using  from `/src/payment`
 */
export const paymentProcessor = stripePaymentProcessor;
// export const paymentProcessor: PaymentProcessor = lemonSqueezyPaymentProcessor;
// export const paymentProcessor: PaymentProcessor = polarPaymentProcessor;
//# sourceMappingURL=paymentProcessor.js.map