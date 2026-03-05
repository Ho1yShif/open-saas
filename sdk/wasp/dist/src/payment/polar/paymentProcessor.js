import { OrderStatus } from "@polar-sh/sdk/models/components/orderstatus.js";
import { fetchUserPaymentProcessorUserId, updateUserPaymentProcessorUserId, } from "../user";
import { createPolarCheckoutSession, ensurePolarCustomer, } from "./checkoutUtils";
import { polarClient } from "./polarClient";
import { polarMiddlewareConfigFn, polarWebhook } from "./webhook";
export const polarPaymentProcessor = {
    id: "polar",
    createCheckoutSession: async ({ userId, userEmail, paymentPlan, prismaUserDelegate, }) => {
        const customer = await ensurePolarCustomer(userId, userEmail);
        await updateUserPaymentProcessorUserId({ userId, paymentProcessorUserId: customer.id }, prismaUserDelegate);
        const checkoutSession = await createPolarCheckoutSession({
            productId: paymentPlan.getPaymentProcessorPlanId(),
            customerId: customer.id,
        });
        return {
            session: {
                id: checkoutSession.id,
                url: checkoutSession.url,
            },
        };
    },
    fetchCustomerPortalUrl: async ({ userId, prismaUserDelegate, }) => {
        const paymentProcessorUserId = await fetchUserPaymentProcessorUserId(userId, prismaUserDelegate);
        if (!paymentProcessorUserId) {
            return null;
        }
        const customerSession = await polarClient.customerSessions.create({
            customerId: paymentProcessorUserId,
        });
        return customerSession.customerPortalUrl;
    },
    webhook: polarWebhook,
    webhookMiddlewareConfigFn: polarMiddlewareConfigFn,
    fetchTotalRevenue: async () => {
        let totalRevenue = 0;
        const result = await polarClient.orders.list({
            limit: 100,
        });
        for await (const page of result) {
            const orders = page.result.items || [];
            for (const order of orders) {
                if (order.status === OrderStatus.Paid && order.totalAmount > 0) {
                    totalRevenue += order.totalAmount;
                }
            }
        }
        // Revenue is in cents so we convert to dollars (or your main currency unit)
        return totalRevenue / 100;
    },
};
//# sourceMappingURL=paymentProcessor.js.map