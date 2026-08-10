import { Router } from "express";
import { OtpRouter } from "../modules/otp/otp.route.js";
import { AuthRouter } from "../modules/auth/auth.route.js";
import { TenantsRouter as SystemOwnerTenantsRouter } from "../modules/systemOwner/tenants/tenants.route.js";
import { SubscriptionBillingRouter } from "../modules/systemOwner/subscription_billing/subscription_billing.route.js";
import { SettingsRouter } from "../modules/systemOwner/settings/settings.route.js";
import { AuditLogsRouter } from "../modules/systemOwner/audit_logs/audit_logs.route.js";
import { TelephonyRouter } from "../modules/systemOwner/telephony/telephony.route.js";
import { DashboardRouter as SystemOwnerDashboardRouter } from "../modules/systemOwner/dashboard/dashboard.route.js";
import { SettingsRouter as BusinessOwnerSettingsRouter } from "../modules/businessowner/settings/settings.route.js";
import { SubscriptionRouter as BusinessOwnerSubscriptionRouter } from "../modules/businessowner/subscription/subscription.route.js";
import { PaymentRouter as BusinessOwnerPaymentRouter } from "../modules/businessowner/payment/payment.route.js";
import { OrderRouter } from "../modules/businessowner/order/order.route.js";
import { AIAgentRouter } from "../modules/businessowner/ai-training/ai-training.route.js";
import { AIAgentRouter as SystemOwnerAIAgentRouter } from "../modules/systemOwner/ai-training/ai-training.route.js";
import { CallSummaryRouter } from "../modules/businessowner/call-summary/call-summary.route.js";
import { DashboardRouter } from "../modules/businessowner/dashboard/dashboard.route.js";
import { WebhookRouter } from "../modules/webhook/webhook.route.js";
import { ItemManagementRouter } from "../modules/businessowner/item_management/item_management.route.js";
import { FreeRouter } from "../modules/freeRoute/freeRoute.route.js";
import { IndividualTenantRouter } from "../modules/systemOwner/individual_tenant/individual_tenant.route.js";
import { BusinessHourRouter } from "../modules/systemOwner/business_hour/business_hour.route.js";
import { PrinterRouter } from "../modules/businessowner/printer/printer.route.js";
import { DevicePrinterRouter } from "../modules/businessowner/printer/device-printer.route.js";

export const router = Router();
const moduleRoutes = [
  // Public Routes
  {
    path: "/free-route",
    route: FreeRouter,
  },

  {
    path: "/otp",
    route: OtpRouter,
  },

  // Common Routes
  {
    path: "/auth",
    route: AuthRouter,
  },

  // System Owner Routes
  {
    path: "/system-owner/tenants",
    route: SystemOwnerTenantsRouter,
  },

  {
    path: "/system-owner/individual-tenant",
    route: IndividualTenantRouter,
  },

  {
    path: "/system-owner/subscription-billing",
    route: SubscriptionBillingRouter,
  },

  {
    path: "/system-owner/settings",
    route: SettingsRouter,
  },

  {
    path: "/system-owner/audit-logs",
    route: AuditLogsRouter,
  },

  {
    path: "/system-owner/telephony",
    route: TelephonyRouter,
  },

  {
    path: "/system-owner/dashboard",
    route: SystemOwnerDashboardRouter,
  },

  {
    path: "/system-owner/agent",
    route: SystemOwnerAIAgentRouter,
  },

  {
    path: "/system-owner/business-hour",
    route: BusinessHourRouter,
  },

  // Business Owner Routes
  {
    path: "/business-owner/settings",
    route: BusinessOwnerSettingsRouter,
  },

  {
    path: "/business-owner/subscription",
    route: BusinessOwnerSubscriptionRouter,
  },

  {
    path: "/business-owner/payment",
    route: BusinessOwnerPaymentRouter,
  },

  {
    path: "/business-owner/agent",
    route: AIAgentRouter,
  },

  {
    path: "/business-owner/call-summary",
    route: CallSummaryRouter,
  },

  {
    path: "/business-owner/order",
    route: OrderRouter,
  },

  {
    path: "/business-owner/dashboard",
    route: DashboardRouter,
  },

  {
    path: "/business-owner/item-management",
    route: ItemManagementRouter,
  },

  {
    path: "/business-owner/printer",
    route: PrinterRouter,
  },

  {
    path: "/printer",
    route: DevicePrinterRouter,
  },

  {
    path: "/webhook",
    route: WebhookRouter,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
