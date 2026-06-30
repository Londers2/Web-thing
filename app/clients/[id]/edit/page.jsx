// app/clients/[id]/edit/page.jsx
import Sidebar from '@/components/sidebar'
import ClientForm from '@/components/clients/ClientForm'
import { Client } from '@/lib/db/index.js'
import { notFound } from 'next/navigation'

export default async function EditClientPage({ params }) {
  const { id } = await params
  
  const client = await Client.findByPk(id)
  
  if (!client) {
    notFound()
  }
  
  const clientData = client.get({ plain: true })
  
  return (
    <Sidebar>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Редактирование клиента</h1>
        <ClientForm client={clientData} isEdit />
      </div>
    </Sidebar>
  )
}