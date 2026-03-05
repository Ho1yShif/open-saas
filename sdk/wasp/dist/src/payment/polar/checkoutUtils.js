import { config } from "wasp/server";
import { polarClient } from "./polarClient";
/**
 * Returns a Polar customer for the given User email, creating a customer if none exist.
 *
 * NOTE: Polar enforces unique emails and `externalId`.
 *       Additionally, `externalId` can't be changed once set.
 */
export async function ensurePolarCustomer(userId, userEmail) {
    const polarCustomers = await polarClient.customers.list({
        email: userEmail,
    });
    if (polarCustomers.result.items.length === 0) {
        return polarClient.customers.create({
            externalId: userId,
            email: userEmail,
        });
    }
    else {
        return polarCustomers.result.items[0];
    }
}
export function createPolarCheckoutSession({ productId, customerId, }) {
    return polarClient.checkouts.create({
        products: [productId],
        successUrl: `${config.frontendUrl}/checkout?status=success`,
        customerId,
    });
}
//# sourceMappingURL=checkoutUtils.js.map