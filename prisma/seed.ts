import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password: string) {
  const salt = await bcryptjs.genSalt(10)
  return bcryptjs.hash(password, salt)
}

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  await prisma.booking.deleteMany({})
  await prisma.service.deleteMany({})
  await prisma.schedule.deleteMany({})
  await prisma.admin.deleteMany({})

  // Create Services
  console.log('📋 Creating services...')
  const services = await Promise.all([
    prisma.service.create({
      data: {
        nameId: 'Potong Rambut Premium',
        nameEn: 'Premium Haircut',
        descId: 'Potong rambut dengan teknik modern dan konsultasi gaya pribadi',
        descEn: 'Modern haircut with personal style consultation',
        price: 100000,
        duration: 45,
        imageUrl: 'https://picsum.photos/seed/seed-service-1/500/500',
        isActive: true,
        order: 1,
      },
    }),
    prisma.service.create({
      data: {
        nameId: 'Pencukuran Kumis & Jenggot',
        nameEn: 'Beard & Mustache Trim',
        descId: 'Pencukuran presisi untuk kumis, jenggot, dan styling',
        descEn: 'Precision trimming for beard and mustache styling',
        price: 75000,
        duration: 30,
        imageUrl: 'https://picsum.photos/seed/seed-service-2/500/500',
        isActive: true,
        order: 2,
      },
    }),
    prisma.service.create({
      data: {
        nameId: 'Paket Lengkap (Potong + Cukur)',
        nameEn: 'Full Grooming Package',
        descId: 'Paket lengkap potong rambut + pencukuran kumis & jenggot + steam',
        descEn: 'Complete package with haircut, beard trim, and steam',
        price: 150000,
        duration: 75,
        imageUrl: 'https://picsum.photos/seed/seed-service-3/500/500',
        isActive: true,
        order: 3,
      },
    }),
    prisma.service.create({
      data: {
        nameId: 'Perawatan Kulit Wajah',
        nameEn: 'Facial Care',
        descId: 'Perawatan kulit wajah dengan produk premium untuk pria',
        descEn: 'Premium facial care treatment for men',
        price: 120000,
        duration: 45,
        imageUrl: 'https://picsum.photos/seed/seed-service-4/500/500',
        isActive: true,
        order: 4,
      },
    }),
    prisma.service.create({
      data: {
        nameId: 'Potong Rambut Anak',
        nameEn: 'Kids Haircut',
        descId: 'Layanan potong rambut khusus untuk anak-anak dengan pendekatan ramah',
        descEn: 'Kids haircut with friendly and fun approach',
        price: 60000,
        duration: 30,
        imageUrl: 'https://picsum.photos/seed/seed-service-5/500/500',
        isActive: true,
        order: 5,
      },
    }),
    prisma.service.create({
      data: {
        nameId: 'Coloring & Bleaching',
        nameEn: 'Hair Coloring',
        descId: 'Pewarna rambut dan bleaching dengan bahan berkualitas tinggi',
        descEn: 'Hair coloring and bleaching with premium products',
        price: 200000,
        duration: 90,
        imageUrl: 'https://picsum.photos/seed/seed-service-6/500/500',
        isActive: true,
        order: 6,
      },
    }),
    prisma.service.create({
      data: {
        nameId: 'Hot Stone Massage',
        nameEn: 'Hot Stone Massage',
        descId: 'Massage relaksasi menggunakan batu panas untuk melegakan otot',
        descEn: 'Relaxing hot stone massage to release muscle tension',
        price: 250000,
        duration: 60,
        imageUrl: 'https://picsum.photos/seed/seed-service-7/500/500',
        isActive: true,
        order: 7,
      },
    }),
    prisma.service.create({
      data: {
        nameId: 'Steam & Facial Treatment',
        nameEn: 'Steam & Facial',
        descId: 'Uap wajah diikuti perawatan wajah intensif dengan masker premium',
        descEn: 'Face steaming with intensive facial treatment and premium mask',
        price: 180000,
        duration: 60,
        imageUrl: 'https://picsum.photos/seed/seed-service-8/500/500',
        isActive: true,
        order: 8,
      },
    }),
  ])

  console.log(`✅ Created ${services.length} services`)

  // Create Schedule for all days
  console.log('📅 Creating schedule...')
  const schedule = await Promise.all([
    prisma.schedule.create({
      data: {
        dayOfWeek: 0, // Sunday
        openTime: '11:00',
        closeTime: '20:00',
        isOpen: true,
      },
    }),
    prisma.schedule.create({
      data: {
        dayOfWeek: 1, // Monday
        openTime: '09:00',
        closeTime: '21:00',
        isOpen: true,
      },
    }),
    prisma.schedule.create({
      data: {
        dayOfWeek: 2, // Tuesday
        openTime: '09:00',
        closeTime: '21:00',
        isOpen: true,
      },
    }),
    prisma.schedule.create({
      data: {
        dayOfWeek: 3, // Wednesday
        openTime: '09:00',
        closeTime: '21:00',
        isOpen: true,
      },
    }),
    prisma.schedule.create({
      data: {
        dayOfWeek: 4, // Thursday
        openTime: '09:00',
        closeTime: '21:00',
        isOpen: true,
      },
    }),
    prisma.schedule.create({
      data: {
        dayOfWeek: 5, // Friday
        openTime: '09:00',
        closeTime: '21:00',
        isOpen: true,
      },
    }),
    prisma.schedule.create({
      data: {
        dayOfWeek: 6, // Saturday
        openTime: '10:00',
        closeTime: '22:00',
        isOpen: true,
      },
    }),
  ])

  console.log(`✅ Created ${schedule.length} schedule entries`)

  // Create default Admin account
  console.log('🔐 Creating admin account...')
  const adminPassword = await hashPassword('admin123')
  await prisma.admin.create({
    data: {
      username: 'admin',
      passwordHash: adminPassword,
    },
  })

  console.log('✅ Created admin account (username: admin, password: admin123)')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
