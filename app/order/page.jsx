// app/orders/page.jsx
import OrderList from '@/components/orders/OrderList'

export default function OrdersPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Заказы</h1>
      <OrderList />
    </div>
  )
}