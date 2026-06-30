// app/clients/new/page.jsx
import Sidebar from '@/components/sidebar'
import ClientForm from '@/components/clients/ClientForm'

export default function NewClientPage() {
  return (
    <Sidebar>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Добавление клиента</h1>
        <ClientForm />
      </div>
    </Sidebar>
  )
}