import { PageContainer } from "@/components/shared/common/page-container"
import { SectionHeader } from "@/components/shared/common/section-header"
import { EmptyState } from "@/components/shared/states/empty-state"

export default function CartPage() {
  return (
    <PageContainer className="space-y-6">
      <SectionHeader
        title="Giỏ hàng"
        description="Màn hình giỏ hàng sẽ tích hợp optimistic update theo hooks đã tạo."
      />
      <EmptyState
        title="Đang triển khai"
        description="Feature cart page sẽ được code ở bước kế tiếp."
      />
    </PageContainer>
  )
}
