'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Coupon, DiscountType } from '@/lib/coupon-data'
import { Ticket, Plus, Pencil, Trash2, X, Check, Copy } from 'lucide-react'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

function emptyForm(): Omit<Coupon, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'> {
  return {
    code: '',
    type: 'PERCENTAGE',
    value: 10,
    minOrderAmount: 0,
    maxUses: null,
    isActive: true,
    expiresAt: null,
    description: '',
  }
}

type FormData = ReturnType<typeof emptyForm>

export default function CouponsClient() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [mounted, setMounted] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm())
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [maxUsesEnabled, setMaxUsesEnabled] = useState(false)
  const [expiresEnabled, setExpiresEnabled] = useState(false)

  useEffect(() => {
    fetch('/api/admin/coupons')
      .then(res => res.json())
      .then(data => setCoupons(data.coupons || []))
      .catch(() => setSaveMsg({ type: 'error', text: 'Failed to load coupons.' }))
      .finally(() => setMounted(true))
  }, [])

  const showMsg = (type: 'success' | 'error', text: string) => {
    setSaveMsg({ type, text })
    setTimeout(() => setSaveMsg(null), 3000)
  }

  const openNew = () => {
    setEditing(null)
    setForm(emptyForm())
    setMaxUsesEnabled(false)
    setExpiresEnabled(false)
    setShowForm(true)
    setSaveMsg(null)
  }

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon)
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount,
      maxUses: coupon.maxUses,
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt,
      description: coupon.description,
    })
    setMaxUsesEnabled(coupon.maxUses !== null)
    setExpiresEnabled(coupon.expiresAt !== null)
    setShowForm(true)
    setSaveMsg(null)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
    setSaveMsg(null)
  }

  const handleSave = async () => {
    const code = form.code.trim().toUpperCase()
    if (!code) return showMsg('error', 'Coupon code is required.')
    if (!/^[A-Z0-9_-]{2,20}$/.test(code))
      return showMsg('error', 'Code must be A-Z, 0-9, -, _ only (2–20 characters).')
    if (form.value <= 0) return showMsg('error', 'Discount value must be greater than zero.')
    if (form.type === 'PERCENTAGE' && form.value > 100)
      return showMsg('error', 'Percentage cannot exceed 100.')

    const payload = {
      ...form,
      code,
      maxUses: maxUsesEnabled ? (form.maxUses ?? 1) : null,
      expiresAt: expiresEnabled ? form.expiresAt : null,
    }

    try {
      const res = await fetch(
        editing ? `/api/admin/coupons/${editing.id}` : '/api/admin/coupons',
        {
          method: editing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      const data = await res.json()
      if (!res.ok) return showMsg('error', data.error || 'Failed to save coupon.')

      if (editing) {
        setCoupons(coupons.map(c => (c.id === editing.id ? data.coupon : c)))
        showMsg('success', 'Coupon updated successfully!')
      } else {
        setCoupons([data.coupon, ...coupons])
        showMsg('success', 'New coupon added!')
      }
      setTimeout(() => closeForm(), 1200)
    } catch {
      showMsg('error', 'Failed to save coupon.')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
      if (!res.ok) return showMsg('error', 'Failed to delete coupon.')
      setCoupons(coupons.filter(c => c.id !== id))
      setDeleteId(null)
      showMsg('success', 'Coupon deleted.')
    } catch {
      showMsg('error', 'Failed to delete coupon.')
    }
  }

  const toggleActive = async (id: string) => {
    const coupon = coupons.find(c => c.id === id)
    if (!coupon) return
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      })
      const data = await res.json()
      if (!res.ok) return showMsg('error', data.error || 'Failed to update status.')
      setCoupons(coupons.map(c => (c.id === id ? data.coupon : c)))
    } catch {
      showMsg('error', 'Failed to update status.')
    }
  }

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    })
  }

  if (!mounted) {
    return (
      <AdminLayout title="Coupon Codes">
        <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>
      </AdminLayout>
    )
  }

  const active = coupons.filter(c => c.isActive && !isExpired(c.expiresAt)).length
  const inactive = coupons.length - active

  return (
    <AdminLayout title="Coupon Codes">
      <div className="max-w-5xl mx-auto">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Coupons', value: coupons.length, color: 'text-gray-800' },
            { label: 'Active', value: active, color: 'text-green-600' },
            { label: 'Inactive / Expired', value: inactive, color: 'text-red-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-700">All Coupon Codes</h2>
          <div className="flex items-center gap-3">
            {saveMsg && (
              <span
                className={`text-sm font-medium px-4 py-1.5 rounded-lg border ${
                  saveMsg.type === 'success'
                    ? 'text-green-600 bg-green-50 border-green-200'
                    : 'text-red-600 bg-red-50 border-red-200'
                }`}
              >
                {saveMsg.text}
              </span>
            )}
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors"
              style={{ backgroundColor: '#800000' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#a86e08' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#800000' }}
            >
              <Plus size={16} />
              Add Coupon
            </button>
          </div>
        </div>

        {/* Coupon Table */}
        {coupons.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <Ticket size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No coupons yet</p>
            <p className="text-sm text-gray-400 mt-1">Click &quot;Add Coupon&quot; above to create your first one</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Discount</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Min. Order</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Uses</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Expires</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.map(coupon => {
                    const expired = isExpired(coupon.expiresAt)
                    const effectivelyActive = coupon.isActive && !expired
                    return (
                      <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-xs tracking-wider">
                              {coupon.code}
                            </span>
                            <button
                              onClick={() => copyCode(coupon.id, coupon.code)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              title="Copy code"
                            >
                              {copiedId === coupon.id ? (
                                <Check size={13} className="text-green-500" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                          {coupon.description && (
                            <p className="text-xs text-gray-400 mt-0.5 max-w-[180px] truncate">{coupon.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600">
                          {coupon.type === 'PERCENTAGE' ? 'Percentage' : 'Fixed'}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-gray-800">
                          {coupon.type === 'PERCENTAGE'
                            ? `${coupon.value}%`
                            : `৳${coupon.value}`}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600">
                          {coupon.minOrderAmount > 0 ? `৳${coupon.minOrderAmount}` : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600">
                          {coupon.usedCount}
                          {coupon.maxUses !== null && (
                            <span className="text-gray-400"> / {coupon.maxUses}</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600">
                          {coupon.expiresAt ? (
                            <span className={expired ? 'text-red-500 font-medium' : ''}>
                              {formatDate(coupon.expiresAt)}
                              {expired && ' (Expired)'}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => toggleActive(coupon.id)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                              effectivelyActive
                                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {effectivelyActive ? 'Active' : expired ? 'Expired' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => openEdit(coupon)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#800000] hover:bg-[#FFF0F0] transition-colors"
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            {deleteId === coupon.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(coupon.id)}
                                  className="px-2 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeleteId(null)}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteId(coupon.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Form Drawer */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closeForm} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-base font-bold text-gray-800">
                {editing ? 'Edit Coupon' : 'Add New Coupon'}
              </h3>
              <button
                onClick={closeForm}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Code */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Coupon Code <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SAVE20, EID100"
                  maxLength={20}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-mono font-bold text-gray-800 text-sm focus:outline-none focus:border-[#800000] tracking-wider transition-colors"
                />
                <p className="text-xs text-gray-400 mt-1">Only A-Z, 0-9, -, _ allowed (2–20 characters)</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Eid special offer"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#800000] transition-colors"
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Discount Type</label>
                <div className="flex gap-3 mb-3">
                  {(['PERCENTAGE', 'FIXED'] as DiscountType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                        form.type === t
                          ? 'bg-[#800000] text-white border-[#800000]'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-[#800000]'
                      }`}
                    >
                      {t === 'PERCENTAGE' ? '% Percentage' : '৳ Fixed Amount'}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Discount Value {form.type === 'PERCENTAGE' ? '(%)' : '(৳)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={form.type === 'PERCENTAGE' ? 100 : undefined}
                    value={form.value}
                    onChange={e => setForm({ ...form, value: Math.max(1, Number(e.target.value)) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#800000] transition-colors"
                  />
                </div>
              </div>

              {/* Min Order */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Minimum Order Amount (৳)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.minOrderAmount}
                  onChange={e => setForm({ ...form, minOrderAmount: Math.max(0, Number(e.target.value)) })}
                  placeholder="0 means no minimum"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#800000] transition-colors"
                />
              </div>

              {/* Max Uses */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="maxUsesCheck"
                    checked={maxUsesEnabled}
                    onChange={e => {
                      setMaxUsesEnabled(e.target.checked)
                      if (e.target.checked && !form.maxUses) setForm({ ...form, maxUses: 100 })
                    }}
                    className="w-4 h-4 accent-[#800000]"
                  />
                  <label htmlFor="maxUsesCheck" className="text-xs font-semibold text-gray-600 cursor-pointer">
                    Set maximum usage limit
                  </label>
                </div>
                {maxUsesEnabled && (
                  <input
                    type="number"
                    min={1}
                    value={form.maxUses ?? 100}
                    onChange={e => setForm({ ...form, maxUses: Math.max(1, Number(e.target.value)) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#800000] transition-colors"
                  />
                )}
              </div>

              {/* Expiry Date */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="expiresCheck"
                    checked={expiresEnabled}
                    onChange={e => {
                      setExpiresEnabled(e.target.checked)
                      if (!e.target.checked) setForm({ ...form, expiresAt: null })
                    }}
                    className="w-4 h-4 accent-[#800000]"
                  />
                  <label htmlFor="expiresCheck" className="text-xs font-semibold text-gray-600 cursor-pointer">
                    Set expiry date
                  </label>
                </div>
                {expiresEnabled && (
                  <input
                    type="date"
                    value={form.expiresAt ? form.expiresAt.split('T')[0] : ''}
                    onChange={e =>
                      setForm({
                        ...form,
                        expiresAt: e.target.value ? `${e.target.value}T23:59:59.000Z` : null,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#800000] transition-colors"
                  />
                )}
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Active</p>
                  <p className="text-xs text-gray-400">Inactive coupons cannot be used by customers</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    form.isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      form.isActive ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {saveMsg && (
                <div
                  className={`text-sm font-medium px-4 py-2 rounded-lg border text-center ${
                    saveMsg.type === 'success'
                      ? 'text-green-600 bg-green-50 border-green-200'
                      : 'text-red-600 bg-red-50 border-red-200'
                  }`}
                >
                  {saveMsg.text}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-lg text-white font-semibold text-sm transition-colors"
                style={{ backgroundColor: '#800000' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#a86e08' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#800000' }}
              >
                {editing ? 'Update Coupon' : 'Add Coupon'}
              </button>
              <button
                onClick={closeForm}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
