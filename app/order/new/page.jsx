// app/orders/new/page.jsx
import OrderForm from '@/components/orders/OrderForm'

export default function NewOrderPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Создание заказа</h1>
      <OrderForm />
    </div>
  )
}