import { requireNodeEnvVar } from "../server/utils";
export var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["PastDue"] = "past_due";
    SubscriptionStatus["CancelAtPeriodEnd"] = "cancel_at_period_end";
    SubscriptionStatus["Active"] = "active";
    SubscriptionStatus["Deleted"] = "deleted";
})(SubscriptionStatus || (SubscriptionStatus = {}));
export var PaymentPlanId;
(function (PaymentPlanId) {
    PaymentPlanId["Hobby"] = "hobby";
    PaymentPlanId["Pro"] = "pro";
    PaymentPlanId["Credits10"] = "credits10";
})(PaymentPlanId || (PaymentPlanId = {}));
export const paymentPlans = {
    [PaymentPlanId.Hobby]: {
        getPaymentProcessorPlanId: () => requireNodeEnvVar("PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID"),
        effect: { kind: "subscription" },
    },
    [PaymentPlanId.Pro]: {
        getPaymentProcessorPlanId: () => requireNodeEnvVar("PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID"),
        effect: { kind: "subscription" },
    },
    [PaymentPlanId.Credits10]: {
        getPaymentProcessorPlanId: () => requireNodeEnvVar("PAYMENTS_CREDITS_10_PLAN_ID"),
        effect: { kind: "credits", amount: 10 },
    },
};
export function prettyPaymentPlanName(planId) {
    const planToName = {
        [PaymentPlanId.Hobby]: "Hobby",
        [PaymentPlanId.Pro]: "Pro",
        [PaymentPlanId.Credits10]: "10 Credits",
    };
    return planToName[planId];
}
export function parsePaymentPlanId(planId) {
    if (Object.values(PaymentPlanId).includes(planId)) {
        return planId;
    }
    else {
        throw new Error(`Invalid PaymentPlanId: ${planId}`);
    }
}
export function getSubscriptionPaymentPlanIds() {
    return Object.values(PaymentPlanId).filter((planId) => paymentPlans[planId].effect.kind === "subscription");
}
/**
 * Returns Open SaaS `PaymentPlanId` for some payment provider's plan ID.
 *
 * Different payment providers track plan ID in different ways.
 * e.g. Stripe price ID, Polar product ID...
 */
export function getPaymentPlanIdByPaymentProcessorPlanId(paymentProcessorPlanId) {
    for (const [planId, plan] of Object.entries(paymentPlans)) {
        if (plan.getPaymentProcessorPlanId() === paymentProcessorPlanId) {
            return planId;
        }
    }
    throw new Error(`Unknown payment processor plan ID: ${paymentProcessorPlanId}`);
}
//# sourceMappingURL=plans.js.map