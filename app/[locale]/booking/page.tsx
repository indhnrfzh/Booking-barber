'use client'

import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'

interface Service {
  id: string
  nameId: string
  nameEn: string
  descId: string
  descEn: string
  price: number
  duration: number
  imageUrl: string
}

interface FormData {
  serviceId: string
  bookingDate: string
  timeSlot: string
  customerName: string
  customerPhone: string
  customerEmail: string
  notes: string
}

export default function BookingPage() {
  const t = useTranslations('booking')
  const pathname = usePathname()
  const router = useRouter()
  const locale = pathname.split('/')[1] || 'id'

  const [step, setStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    serviceId: '',
    bookingDate: '',
    timeSlot: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch services on mount
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoadingServices(true)
      try {
        const response = await fetch('/api/services')
        if (response.ok) {
          const data = await response.json()
          setServices(data.services)
        }
      } catch (error) {
        console.error('Error fetching services:', error)
      } finally {
        setIsLoadingServices(false)
      }
    }

    fetchServices()
  }, [])

  // Fetch available slots when date or service changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!formData.serviceId || !formData.bookingDate) {
        setAvailableTimeSlots([])
        return
      }

      setIsLoadingSlots(true)
      try {
        const response = await fetch(
          `/api/schedule/slots?date=${formData.bookingDate}&serviceId=${formData.serviceId}`
        )
        if (response.ok) {
          const data = await response.json()
          setAvailableTimeSlots(data.slots || [])
          // Clear selected time slot if it's no longer available
          if (formData.timeSlot && !data.slots.includes(formData.timeSlot)) {
            setFormData(prev => ({ ...prev, timeSlot: '' }))
          }
        }
      } catch (error) {
        console.error('Error fetching available slots:', error)
      } finally {
        setIsLoadingSlots(false)
      }
    }

    fetchAvailableSlots()
  }, [formData.bookingDate, formData.serviceId, formData.timeSlot])

  const selectedService = services.find((s) => s.id === formData.serviceId)

  const handleServiceSelect = (serviceId: string) => {
    setFormData({ ...formData, serviceId })
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, bookingDate: e.target.value })
  }

  const handleTimeSelect = (timeSlot: string) => {
    setFormData({ ...formData, timeSlot })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (step === 1 && !formData.serviceId) {
      newErrors.serviceId = locale === 'id' ? 'Pilih layanan terlebih dahulu' : 'Please select a service'
    }

    if (step === 2) {
      if (!formData.bookingDate) newErrors.bookingDate = locale === 'id' ? 'Pilih tanggal' : 'Select date'
      if (!formData.timeSlot) newErrors.timeSlot = locale === 'id' ? 'Pilih waktu' : 'Select time'
    }

    if (step === 3) {
      if (!formData.customerName) newErrors.customerName = locale === 'id' ? 'Nama diperlukan' : 'Name required'
      if (!formData.customerPhone) newErrors.customerPhone = locale === 'id' ? 'Nomor HP diperlukan' : 'Phone required'
      if (!formData.customerEmail) newErrors.customerEmail = locale === 'id' ? 'Email diperlukan' : 'Email required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      if (step < 4) setStep(step + 1)
    }
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/${locale}/booking/konfirmasi?code=${data.bookingCode}`)
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.error || 'Failed to create booking' })
      }
    } catch (error) {
      console.error('Booking error:', error)
      setErrors({ submit: 'An error occurred while creating booking' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const serviceName = locale === 'id' ? 'nameId' : 'nameEn'

  return (
    <>
      {/* Hero */}
      <section className="relative py-16 bg-linear-to-b from-[#141414] to-[#0A0A0A]">
        <div className="container text-center">
          <h1 className="font-cormorant text-4xl sm:text-5xl font-bold text-[#F5F5F0] mb-2">
            {t('title')}
          </h1>
        </div>
      </section>

      {/* Booking Form */}
      <section className="section-py pb-[max(5rem,env(safe-area-inset-bottom))]">
        <div className="container max-w-2xl">
          {/* Step Indicator */}
          <div className="flex justify-between items-center mb-12">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    s <= step
                      ? 'bg-[#C9A84C] text-black'
                      : 'bg-[#2A2A25] text-[#5A5A55]'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-px mx-2 ${
                      s < step ? 'bg-[#C9A84C]' : 'bg-[#2A2A25]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Service Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[#F5F5F0]">{t('selectService')}</h2>
              {isLoadingServices ? (
                <div className="text-center py-8 text-[#A0A09A]">
                  {locale === 'id' ? 'Memuat layanan...' : 'Loading services...'}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleServiceSelect(service.id)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all flex items-center gap-4 ${
                        formData.serviceId === service.id
                          ? 'border-[#C9A84C] bg-[#C9A84C]/10'
                          : 'border-[#2A2A25] hover:border-[#C9A84C]'
                      }`}
                    >
                      <div className="relative w-16 h-16 rounded overflow-hidden shrink-0">
                        <Image src={service.imageUrl} alt={service[serviceName]} fill sizes="64px" className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#F5F5F0]">{service[serviceName]}</h3>
                        <p className="text-sm text-[#A0A09A]">{service.duration} min</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-[#C9A84C]">{formatPrice(service.price, locale)}</p>
                        {formData.serviceId === service.id && (
                          <div className="text-[#C9A84C] text-sm">✓ Selected</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[#F5F5F0]">{t('selectDateTime')}</h2>

              <div>
                <label className="block text-sm font-medium text-[#F5F5F0] mb-3">
                  {locale === 'id' ? 'Pilih Tanggal' : 'Select Date'}
                </label>
                <input
                  type="date"
                  value={formData.bookingDate}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
                {errors.bookingDate && <p className="text-red-400 text-sm mt-1">{errors.bookingDate}</p>}
              </div>

              {formData.bookingDate && (
                <div>
                  <label className="block text-sm font-medium text-[#F5F5F0] mb-3">
                    {locale === 'id' ? 'Pilih Waktu' : 'Select Time'}
                  </label>
                  {isLoadingSlots ? (
                    <div className="text-center py-4 text-[#A0A09A]">
                      {locale === 'id' ? 'Memuat waktu tersedia...' : 'Loading available times...'}
                    </div>
                  ) : availableTimeSlots.length === 0 ? (
                    <div className="text-center py-4 text-[#A0A09A]">
                      {locale === 'id' ? 'Tidak ada waktu tersedia untuk tanggal ini' : 'No available times for this date'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {availableTimeSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => handleTimeSelect(slot)}
                          className={`min-h-12 py-3 rounded-lg transition-all font-medium touch-manipulation ${
                            formData.timeSlot === slot
                              ? 'bg-[#C9A84C] text-black'
                              : 'bg-[#1C1C1C] text-[#F5F5F0] border border-[#2A2A25] hover:border-[#C9A84C]'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.timeSlot && <p className="text-red-400 text-sm mt-2">{errors.timeSlot}</p>}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Personal Info */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[#F5F5F0]">{t('step3')}</h2>

              <Input
                label={t('fullName')}
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                placeholder={locale === 'id' ? 'Nama Lengkap' : 'Full Name'}
                error={errors.customerName}
                containerClassName="space-y-2"
              />

              <Input
                label={t('phone')}
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                placeholder={locale === 'id' ? '+62' : '+62'}
                error={errors.customerPhone}
                containerClassName="space-y-2"
              />

              <Input
                label={t('email')}
                name="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={handleInputChange}
                placeholder="email@example.com"
                error={errors.customerEmail}
                containerClassName="space-y-2"
              />

              <div>
                <label className="block text-sm font-medium text-[#F5F5F0] mb-2">{t('notes')} ({locale === 'id' ? 'Opsional' : 'Optional'})</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder={locale === 'id' ? 'Catatan khusus...' : 'Special notes...'}
                  rows={3}
                  className="input-field resize-y min-h-24"
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && selectedService && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[#F5F5F0]">{t('step4')}</h2>

              <div className="bg-[#141414] border border-[#2A2A25] rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-[#A0A09A] text-sm">{t('service')}</p>
                  <p className="text-lg font-semibold text-[#F5F5F0]">{selectedService[serviceName]}</p>
                </div>

                <div>
                  <p className="text-[#A0A09A] text-sm">{t('dateTime')}</p>
                  <p className="text-lg font-semibold text-[#F5F5F0]">
                    {new Date(formData.bookingDate).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US')} · {formData.timeSlot}
                  </p>
                </div>

                <div>
                  <p className="text-[#A0A09A] text-sm">{t('duration')}</p>
                  <p className="text-lg font-semibold text-[#F5F5F0]">{selectedService.duration} menit</p>
                </div>

                <div>
                  <p className="text-[#A0A09A] text-sm">{t('price')}</p>
                  <p className="text-2xl font-bold text-[#C9A84C]">{formatPrice(selectedService.price, locale)}</p>
                </div>

                <div className="border-t border-[#2A2A25] pt-4">
                  <p className="text-[#A0A09A] text-sm">{t('bookingDetails')}</p>
                  <p className="text-[#F5F5F0]">{formData.customerName}</p>
                  <p className="text-[#F5F5F0]">{formData.customerPhone}</p>
                  <p className="text-[#F5F5F0]">{formData.customerEmail}</p>
                  {formData.notes && <p className="text-[#A0A09A] mt-2 italic">{formData.notes}</p>}
                </div>
              </div>

              <label className="flex items-center gap-3 text-[#F5F5F0]">
                <input type="checkbox" className="w-4 h-4 accent-[#C9A84C]" required />
                <span className="text-sm">
                  {locale === 'id' 
                    ? 'Saya setuju dengan persyaratan dan ketentuan'
                    : 'I agree to the terms and conditions'}
                </span>
              </label>

              {errors.submit && (
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400 text-sm">
                  {errors.submit}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-4 justify-between mt-12">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={step === 1}
              className="w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {locale === 'id' ? 'Kembali' : 'Back'}
            </Button>

            {step < 4 ? (
              <Button onClick={handleNext} className="w-full sm:w-auto">
                {locale === 'id' ? 'Lanjut' : 'Next'}
              </Button>
            ) : (
              <Button onClick={handleSubmit} isLoading={isSubmitting} className="w-full sm:w-auto">
                {t('confirm')}
              </Button>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
