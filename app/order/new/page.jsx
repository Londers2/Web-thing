// app/orders/new/page.jsx
import Sidebar from '@/components/sidebar'
import OrderForm from '@/components/orders/OrderForm'

export default function NewOrderPage() {
  return (
    <Sidebar>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Создание заказа</h1>
        <OrderForm />
      </div>
    </Sidebar>
  )
}