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

function getSchemaSearchPath(rawUrl: string): string | undefined {
  try {
    const url = new URL(rawUrl)
    // Neon pooler does not support startup options; omit to avoid connection errors
    if (url.hostname.includes('pooler')) {
      return undefined
    }
    const schema = url.searchParams.get('schema')
    return schema ? `-c search_path=${schema}` : undefined
  } catch {
    return undefined
  }
}

const pool = new Pool({
  connectionString: normalizeDatabaseUrl(databaseUrl),
  options: getSchemaSearchPath(databaseUrl),
})

function getPgSchema(rawUrl: string): string | undefined {
  try {
    return new URL(rawUrl).searchParams.get('schema') ?? undefined
  } catch {
    return undefined
  }
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool, { schema: getPgSchema(databaseUrl) }),
})

async function hashPassword(password: string) {
  const salt = await bcryptjs.genSalt(10)
  return bcryptjs.hash(password, salt)
}

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data in foreign key dependency order
  await prisma.pointLedger.deleteMany({})
  await prisma.booking.deleteMany({})
  await prisma.voucher.deleteMany({})
  await prisma.reward.deleteMany({})
  await prisma.member.deleteMany({})
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
        imageUrl: '/Foto/bshop-1.jpg',
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
        imageUrl: '/Foto/bshop-2.jpg',
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
        imageUrl: '/Foto/bshop-3.jpg',
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
        imageUrl: '/Foto/bshop-4.jpg',
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
        imageUrl: '/Foto/bshop-5.jpg',
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
        imageUrl: '/Foto/bshop-6.jpg',
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
        imageUrl: '/Foto/bshop-7.jpg',
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
        imageUrl: '/Foto/bshop-8.jpg',
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
        src: '/Foto/bshop-1.jpg',
        category: 'fade',
        alt: 'Professional Barber Haircut',
        order: 1,
        isActive: true,
      },
    }),
    prisma.galleryImage.create({
      data: {
        src: '/Foto/bshop-2.jpg',
        category: 'beard',
        alt: 'Beard Styling & Grooming',
        order: 2,
        isActive: true,
      },
    }),
    prisma.galleryImage.create({
      data: {
        src: '/Foto/bshop-3.jpg',
        category: 'pompadour',
        alt: 'Professional Barber Shop',
        order: 3,
        isActive: true,
      },
    }),
    prisma.galleryImage.create({
      data: {
        src: '/Foto/bshop-4.jpg',
        category: 'undercut',
        alt: 'Fade Haircut Technique',
        order: 4,
        isActive: true,
      },
    }),
    prisma.galleryImage.create({
      data: {
        src: '/Foto/bshop-5.jpg',
        category: 'fade',
        alt: 'Haircut Portfolio 5',
        order: 5,
        isActive: true,
      },
    }),
    prisma.galleryImage.create({
      data: {
        src: '/Foto/bshop-6.jpg',
        category: 'pompadour',
        alt: 'Grooming Service 6',
        order: 6,
        isActive: true,
      },
    }),
    prisma.galleryImage.create({
      data: {
        src: '/Foto/bshop-7.jpg',
        category: 'undercut',
        alt: 'Barber Portfolio 7',
        order: 7,
        isActive: true,
      },
    }),
    prisma.galleryImage.create({
      data: {
        src: '/Foto/bshop-8.jpg',
        category: 'beard',
        alt: 'Beard Grooming 8',
        order: 8,
        isActive: true,
      },
    }),
    prisma.galleryImage.create({
      data: {
        src: '/Foto/bshop-1.jpg',
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
    { key: 'phone', valueId: '+62 857-5186-4219', valueEn: '+62 857-5186-4219' },
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
    { key: 'reminder_interval_days', valueId: '30', valueEn: '30' },
    {
      key: 'reminder_template',
      valueId: 'Halo {name}! 💈 Sudah waktunya rapikan rambutmu kembali di Prestige Barbershop. Kamu punya {points} poin untuk ditukar diskon. Booking jadwalmu di sini: {link}',
      valueEn: 'Hello {name}! 💈 Time for your fresh haircut at Prestige Barbershop. You have {points} loyalty points. Book your slot here: {link}',
    },
  ]
  await Promise.all(
    settingsData.map((s) =>
      prisma.siteSettings.create({ data: s })
    )
  )
  console.log(`✅ Created ${settingsData.length} site settings`)

  // Create Rewards
  console.log('🎁 Creating loyalty rewards...')
  const rewards = await Promise.all([
    prisma.reward.create({
      data: {
        nameId: 'Diskon 10% Semua Layanan',
        nameEn: '10% Discount All Services',
        pointsCost: 100,
        discountType: 'PERCENT',
        discountValue: 10,
        isActive: true,
        order: 1,
      },
    }),
    prisma.reward.create({
      data: {
        nameId: 'Potongan Langsung Rp 20.000',
        nameEn: 'IDR 20,000 Direct Off',
        pointsCost: 150,
        discountType: 'FIXED',
        discountValue: 20000,
        isActive: true,
        order: 2,
      },
    }),
    prisma.reward.create({
      data: {
        nameId: 'Diskon 25% Paket Lengkap',
        nameEn: '25% Discount Grooming Package',
        pointsCost: 250,
        discountType: 'PERCENT',
        discountValue: 25,
        isActive: true,
        order: 3,
      },
    }),
  ])
  console.log(`✅ Created ${rewards.length} loyalty rewards`)

  // Create Demo Member
  console.log('👤 Creating demo member...')
  const demoMember = await prisma.member.create({
    data: {
      memberCode: 'MBR-DEMO01',
      name: 'Budi Santoso',
      phone: '6281234567890',
      email: 'budi.member@example.com',
      waOptIn: true,
    },
  })
  await prisma.pointLedger.create({
    data: {
      memberId: demoMember.id,
      delta: 150,
      note: 'Bonus selamat datang',
    },
  })
  console.log('✅ Created demo member (code: MBR-DEMO01, balance: 150 points)')

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
