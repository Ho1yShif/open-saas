// @ts-nocheck
// EMAIL AUTH DISABLED — using usernameAndPassword auth for Render deployment.
// To re-enable: switch auth back to email: { ... } in main.wasp, configure emailSender,
// and restore the three routes (RequestPasswordReset, PasswordReset, EmailVerification).

import { ResetPasswordForm } from "wasp/client/auth";
import { Link as WaspRouterLink, routes } from "wasp/client/router";
import { AuthPageLayout } from "../AuthPageLayout";

export function PasswordResetPage() {
  return (
    <AuthPageLayout>
      <ResetPasswordForm />
      <br />
      <span className="text-sm font-medium text-gray-900">
        If everything is okay,{" "}
        <WaspRouterLink to={routes.LoginRoute.to}>go to login</WaspRouterLink>
      </span>
    </AuthPageLayout>
  );
}
