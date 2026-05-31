import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcryptjs from 'bcryptjs'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set for seed execution.')
}

function normalizeDatabaseUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl)
    const sslMode = url.searchParams.get('sslmode')

    if (sslMode === 'prefer' || sslMode === 'require' || sslMode === 'verify-ca') {
      url.searchParams.set('sslmode', 'verify-full')
    }

    return url.toString()
  } catch {
    return rawUrl
  }
}

const pool = new Pool({
  connectionString: normalizeDatabaseUrl(databaseUrl),
})

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
})

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
  await prisma.galleryImage.deleteMany({})
  await prisma.testimonial.deleteMany({})
  await prisma.siteSettings.deleteMany({})
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

  // Create Gallery Images
  console.log('🖼️ Creating gallery images...')
  const galleryImages = await Promise.all([
    prisma.galleryImage.create({
      data: {
        src: 'https://picsum.photos/seed/gallery-full-1/800/800',
        category: 'fade',
        alt: 'Gallery 1',
        order: 1,
        isActive: true,
      },
    }),
    prisma.galleryImage.create({
      data: {
        src: 'https://picsum.photos/seed/gallery-full-2/800/800',
        category: 'beard',
        alt: 'Gallery 2',
        order: 2,
        isActive: true,
      },
    }),
    prisma.galleryImage.create({
      data: {
        src: 'https://picsum.photos/seed/gallery-full-3/800/800',
        category: 'pompadour',
        alt: 'Gallery 3',
        order: 3,
        isActive: true,
      },
    }),
    prisma.galleryImage.create({
      data: {
        src: 'https://picsum.photos/seed/gallery-full-4/800/800',
        category: 'undercut',
        alt: 'Gallery 4',
        order: 4,
        isActive: true,
      },
    }),
    prisma.galleryImage.create({
      data: {
        src: 'https://picsum.photos/seed/gallery-full-5/800/800',
        category: 'fade',
        alt: 'Gallery 5',
        order: 5,
        isActive: true,
      },
    }),
    prisma.galleryImage.create({
      data: {
        src: 'https://picsum.photos/seed/gallery-full-6/800/800',
        category: 'pompadour',
        alt: 'Gallery 6',
        order: 6,
        isActive: true,
      },
    }),
    prisma.galleryImage.create({
      data: {
        src: 'https://picsum.photos/seed/gallery-full-7/800/800',
        category: 'undercut',
        alt: 'Gallery 7',
        order: 7,
        isActive: true,
      },
    }),
    prisma.galleryImage.create({
      data: {
        src: 'https://picsum.photos/seed/gallery-full-8/800/800',
        category: 'beard',
        alt: 'Gallery 8',
        order: 8,
        isActive: true,
      },
    }),
    prisma.galleryImage.create({
      data: {
        src: 'https://picsum.photos/seed/gallery-full-9/800/800',
        category: 'fade',
        alt: 'Gallery 9',
        order: 9,
        isActive: true,
      },
    }),
  ])

  console.log(`✅ Created ${galleryImages.length} gallery images`)

  // Create Testimonials
  console.log('💬 Creating testimonials...')
  const testimonials = await Promise.all([
    prisma.testimonial.create({
      data: {
        textId: 'Pengalaman terbaik! Barberman di Prestige sangat profesional dan hasil potonannya sempurna. Saya jadi langganan tetap.',
        textEn: 'Best experience ever! The barbers at Prestige are very professional and the cuts are perfect. I\'ve become a regular customer.',
        author: 'Budi Santoso',
        rating: 5,
        order: 1,
        isActive: true,
      },
    }),
    prisma.testimonial.create({
      data: {
        textId: 'Atmosfer santai namun premium. Saya merasa dihargai sebagai klien di sini. Highly recommended untuk semua pria yang peduli penampilan.',
        textEn: 'Relaxed yet premium atmosphere. I feel valued as a client here. Highly recommended for all men who care about their appearance.',
        author: 'Rudi Hermawan',
        rating: 5,
        order: 2,
        isActive: true,
      },
    }),
    prisma.testimonial.create({
      data: {
        textId: 'Layanan cepat, rapi, dan profesional. Harga sesuai kualitas. Ini tempat yang tepat untuk grooming berkualitas.',
        textEn: 'Fast, neat, and professional service. Price matches quality. This is the right place for quality grooming.',
        author: 'Ahmad Wijaya',
        rating: 5,
        order: 3,
        isActive: true,
      },
    }),
  ])

  console.log(`✅ Created ${testimonials.length} testimonials`)

  // Create Site Settings
  console.log('⚙️ Creating site settings...')
  const settingsData = [
    { key: 'phone', valueId: '+62 858-1234-5678', valueEn: '+62 858-1234-5678' },
    { key: 'email', valueId: 'info@prestigebarbershop.id', valueEn: 'info@prestigebarbershop.id' },
    { key: 'address', valueId: 'Jl. Merdeka No. 123, Jakarta Selatan 12345', valueEn: 'Jl. Merdeka No. 123, South Jakarta 12345' },
    { key: 'footer_about', valueId: 'Prestige Barbershop adalah tempat di mana gaya bertemu dengan presisi. Kami berkomitmen memberikan layanan barbershop kelas dunia.', valueEn: 'Prestige Barbershop is where style meets precision. We are committed to delivering world-class barbershop services.' },
    { key: 'footer_copyright', valueId: '© 2024 Prestige Barbershop. Semua hak dilindungi.', valueEn: '© 2024 Prestige Barbershop. All rights reserved.' },
    { key: 'stat1_value', valueId: '500+', valueEn: '500+' },
    { key: 'stat1_label', valueId: 'Klien Puas', valueEn: 'Happy Clients' },
    { key: 'stat2_value', valueId: '10+', valueEn: '10+' },
    { key: 'stat2_label', valueId: 'Tahun Pengalaman', valueEn: 'Years of Experience' },
    { key: 'stat3_value', valueId: '5★', valueEn: '5★' },
    { key: 'stat3_label', valueId: 'Rating', valueEn: 'Rating' },
  ]
  await Promise.all(
    settingsData.map((s) =>
      prisma.siteSettings.create({ data: s })
    )
  )
  console.log(`✅ Created ${settingsData.length} site settings`)

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
    await pool.end()
  })
