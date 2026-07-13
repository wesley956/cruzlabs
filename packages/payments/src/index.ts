export type CheckoutRequest = {
  businessId: string;
  planId: string;
  payerEmail: string;
  externalReference: string;
};

export type CheckoutResult = {
  providerCheckoutId: string;
  checkoutUrl: string;
};

export interface PaymentProvider {
  createSubscriptionCheckout(request: CheckoutRequest): Promise<CheckoutResult>;
  cancelSubscription(providerSubscriptionId: string): Promise<void>;
  getSubscription(providerSubscriptionId: string): Promise<unknown>;
  verifyWebhook(headers: Headers, rawBody: string): Promise<boolean>;
}
