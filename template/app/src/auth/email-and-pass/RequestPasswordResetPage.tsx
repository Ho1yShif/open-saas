// @ts-nocheck
// EMAIL AUTH DISABLED — using usernameAndPassword auth for Render deployment.
// To re-enable: switch auth back to email: { ... } in main.wasp, configure emailSender,
// and restore the three routes (RequestPasswordReset, PasswordReset, EmailVerification).

import { ForgotPasswordForm } from "wasp/client/auth";
import { AuthPageLayout } from "../AuthPageLayout";

export function RequestPasswordResetPage() {
  return (
    <AuthPageLayout>
      <ForgotPasswordForm />
    </AuthPageLayout>
  );
}
