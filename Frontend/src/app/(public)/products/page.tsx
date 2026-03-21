import { PageContainer } from "@/components/shared/common/page-container"
import { SectionHeader } from "@/components/shared/common/section-header"
import { EmptyState } from "@/components/shared/states/empty-state"

export default function ProductsPage() {
  return (
    <PageContainer className="space-y-6">
      <SectionHeader
        title="Danh sách sản phẩm"
        description="Màn hình sẽ được build tiếp với filter, sort và phân trang."
      />
      <EmptyState
        title="Đang triển khai"
        description="Feature products list sẽ được code ở bước kế tiếp."
      />
    </PageContainer>
  )
}
