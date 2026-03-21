export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED"

export type PaymentMethodCode = "CASH" | "CARD" | "MOMO" | "VNPAY" | "PAYPAL"

export interface PaymentMethod {
  id: number
  code: PaymentMethodCode
  name: string
}

export interface PaymentCardDetails {
  cardType: string
  last4Digits: string
  cardHolderName: string
  bankName: string
}

export interface PaymentEwalletDetails {
  provider: "MOMO" | "VNPAY" | "ZALOPAY" | "PAYPAL"
  transactionId: string
  responseCode?: string
}

export interface Payment {
  id: number
  orderId: number
  paymentMethodId: number
  status: PaymentStatus
  amount: number
  transactionId?: string
  createdAt: string
  updatedAt: string
  cardDetails?: PaymentCardDetails
  ewalletDetails?: PaymentEwalletDetails
}

export interface CreatePaymentRequest {
  orderId: number
  paymentMethodId: number
  cardDetails?: Partial<PaymentCardDetails>
  ewalletDetails?: Partial<PaymentEwalletDetails>
}
