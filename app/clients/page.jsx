// app/clients/page.jsx
import ClientList from '@/components/clients/ClientList'

export default function ClientsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Клиенты</h1>
      <ClientList />
    </div>
  )
}