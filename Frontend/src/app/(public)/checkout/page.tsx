import { PageContainer } from "@/components/shared/common/page-container"
import { SectionHeader } from "@/components/shared/common/section-header"
import { EmptyState } from "@/components/shared/states/empty-state"

export default function CheckoutPage() {
  return (
    <PageContainer className="space-y-6">
      <SectionHeader
        title="Checkout"
        description="Màn hình checkout sẽ dùng create order + create payment hooks."
      />
      <EmptyState
        title="Đang triển khai"
        description="Feature checkout sẽ được code ở bước kế tiếp."
      />
    </PageContainer>
  )
}
