import { User } from "wasp/entities";
import { PrismaClient } from "wasp/server";
import { PaymentPlanId, SubscriptionStatus } from "./plans";
export declare function fetchUserPaymentProcessorUserId(userId: User["id"], prismaUserDelegate: PrismaClient["user"]): Promise<string | null>;
interface UpdateUserPaymentProcessorUserIdArgs {
    userId: User["id"];
    paymentProcessorUserId: NonNullable<User["paymentProcessorUserId"]>;
}
export declare function updateUserPaymentProcessorUserId({ userId, paymentProcessorUserId }: UpdateUserPaymentProcessorUserIdArgs, prismaUserDelegate: PrismaClient["user"]): Promise<User>;
interface UpdateUserSubscriptionArgs {
    paymentProcessorUserId: NonNullable<User["paymentProcessorUserId"]>;
    subscriptionStatus: SubscriptionStatus;
    paymentPlanId?: PaymentPlanId;
    datePaid?: Date;
}
export declare function updateUserSubscription({ paymentProcessorUserId, paymentPlanId, subscriptionStatus, datePaid, }: UpdateUserSubscriptionArgs, userDelegate: PrismaClient["user"]): Promise<User>;
interface UpdateUserCreditsArgs {
    paymentProcessorUserId: NonNullable<User["paymentProcessorUserId"]>;
    numOfCreditsPurchased: number;
    datePaid: Date;
}
export declare function updateUserCredits({ paymentProcessorUserId, numOfCreditsPurchased, datePaid, }: UpdateUserCreditsArgs, userDelegate: PrismaClient["user"]): Promise<User>;
export {};
//# sourceMappingURL=user.d.ts.map