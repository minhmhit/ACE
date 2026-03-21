import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PublicHomePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/35 bg-white/45 p-8 shadow-xl backdrop-blur-xl">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-emerald-700">
          Coffee OOAD
        </p>
        <h1 className="text-3xl font-heading font-semibold text-slate-800 md:text-4xl">
          Nền tảng thương mại cà phê hiện đại
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          Đây là skeleton cho end-user app. Các flow sản phẩm, giỏ hàng,
          checkout và thanh toán sẽ được triển khai theo feature module.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/45 bg-white/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Catalog</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Danh sách và chi tiết sản phẩm.
          </CardContent>
        </Card>
        <Card className="border-white/45 bg-white/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Cart & Checkout</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Luồng đặt hàng và áp mã giảm giá.
          </CardContent>
        </Card>
        <Card className="border-white/45 bg-white/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            MOMO, VNPAY, COD và lịch sử thanh toán.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
