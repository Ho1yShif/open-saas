export async function fetchUserPaymentProcessorUserId(userId, prismaUserDelegate) {
    const user = await prismaUserDelegate.findUniqueOrThrow({
        where: {
            id: userId,
        },
        select: {
            paymentProcessorUserId: true,
        },
    });
    return user.paymentProcessorUserId;
}
export function updateUserPaymentProcessorUserId({ userId, paymentProcessorUserId }, prismaUserDelegate) {
    return prismaUserDelegate.update({
        where: {
            id: userId,
        },
        data: {
            paymentProcessorUserId,
        },
    });
}
export function updateUserSubscription({ paymentProcessorUserId, paymentPlanId, subscriptionStatus, datePaid, }, userDelegate) {
    return userDelegate.update({
        where: {
            paymentProcessorUserId,
        },
        data: {
            subscriptionPlan: paymentPlanId,
            subscriptionStatus,
            datePaid,
        },
    });
}
export function updateUserCredits({ paymentProcessorUserId, numOfCreditsPurchased, datePaid, }, userDelegate) {
    return userDelegate.update({
        where: {
            paymentProcessorUserId,
        },
        data: {
            credits: { increment: numOfCreditsPurchased },
            datePaid,
        },
    });
}
//# sourceMappingURL=user.js.map