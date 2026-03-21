import { PageContainer } from "@/components/shared/common/page-container"
import { SectionHeader } from "@/components/shared/common/section-header"
import { EmptyState } from "@/components/shared/states/empty-state"

export default function ProfilePage() {
  return (
    <PageContainer className="space-y-6">
      <SectionHeader
        title="Tài khoản của tôi"
        description="Màn hình profile sẽ dùng useMeQuery + sessions management."
      />
      <EmptyState
        title="Đang triển khai"
        description="Feature profile page sẽ được code ở bước kế tiếp."
      />
    </PageContainer>
  )
}
