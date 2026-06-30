// app/orders/page.jsx
import Sidebar from '@/components/sidebar'
import OrderList from '@/components/orders/OrderList'

export default function OrdersPage() {
  return (
    <Sidebar>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Заказы</h1>
        <OrderList />
      </div>
    </Sidebar>
  )
}