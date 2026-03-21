import { PageContainer } from "@/components/shared/common/page-container"
import { SectionHeader } from "@/components/shared/common/section-header"
import { EmptyState } from "@/components/shared/states/empty-state"

export default function OrdersPage() {
  return (
    <PageContainer className="space-y-6">
      <SectionHeader
        title="Lịch sử đơn hàng"
        description="Màn hình lịch sử đơn sẽ dùng useMyOrdersQuery và useOrderDetailQuery."
      />
      <EmptyState
        title="Đang triển khai"
        description="Feature orders page sẽ được code ở bước kế tiếp."
      />
    </PageContainer>
  )
}
