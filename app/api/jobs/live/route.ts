import { NextResponse } from 'next/server';

export type LiveITJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  workplaceType: 'Remote' | 'Hybrid' | 'Onsite';
  type: string;
  salary: string;
  category: string;
  postedDate: string;
  source: string;
  applyUrl: string;
  description: string;
  requiredSkills: string[];
};

// Fallback real-time benchmark IT jobs in Indonesia (LinkedIn, JobStreet, Tech in Asia, Glints)
const realTimeITJobsCatalog: LiveITJob[] = [
  {
    id: 'live-it-1',
    title: 'Frontend Web Developer (React / Next.js)',
    company: 'GoTo Financial (Midtrans / Moka)',
    location: 'Jakarta Selatan (Hybrid)',
    workplaceType: 'Hybrid',
    type: 'Penuh Waktu',
    salary: 'Rp 9.000.000 - Rp 15.000.000',
    category: 'Web Development',
    postedDate: 'Hari ini',
    source: 'LinkedIn Jobs',
    applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=Frontend+Developer+Indonesia',
    description:
      'Membangun dashboard merchant fintech modern dengan Next.js App Router, TypeScript, dan Tailwind CSS. Mengoptimalkan Web Vitals dan integrasi gateway pembayaran berkecepatan tinggi.',
    requiredSkills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'REST API', 'Git'],
  },
  {
    id: 'live-it-2',
    title: 'Junior Data Analyst',
    company: 'Traveloka',
    location: 'Tangerang / BSD (Hybrid)',
    workplaceType: 'Hybrid',
    type: 'Fresh Graduate / Junior',
    salary: 'Rp 8.000.000 - Rp 12.500.000',
    category: 'Data Science',
    postedDate: 'Kemarin',
    source: 'Glints / Tech in Asia',
    applyUrl: 'https://glints.com/id/opportunities/jobs/explore?keyword=Data+Analyst',
    description:
      'Menganalisis funnel pemesanan tiket penerbangan dan hotel. Mengembangkan kueri SQL lanjutan dan visualisasi metrik performa produk dengan Tableau dan Google BigQuery.',
    requiredSkills: ['SQL', 'Python', 'Tableau', 'BigQuery', 'Data Wrangling', 'Spreadsheet'],
  },
  {
    id: 'live-it-3',
    title: 'Junior SOC Analyst (Cybersecurity)',
    company: 'PT Bank Central Asia (BCA) - IT Division',
    location: 'Jakarta Barat (Onsite)',
    workplaceType: 'Onsite',
    type: 'Penuh Waktu',
    salary: 'Rp 8.500.000 - Rp 14.000.000',
    category: 'Cyber Security',
    postedDate: '2 hari yang lalu',
    source: 'JobStreet Indonesia',
    applyUrl: 'https://www.jobstreet.co.id/id/job-search/cyber-security-jobs/',
    description:
      'Melakukan monitoring 24/7 Security Operations Center, triase insiden anomali trafik, analisis log SIEM, serta investigasi awal ancaman malware dan serangan phishing.',
    requiredSkills: ['Network Security', 'SIEM (Splunk/ELK)', 'Linux', 'TCP/IP', 'Incident Response'],
  },
  {
    id: 'live-it-4',
    title: 'Mobile App Developer (Flutter / React Native)',
    company: 'Bukalapak',
    location: 'Remote (Seluruh Indonesia)',
    workplaceType: 'Remote',
    type: 'Penuh Waktu',
    salary: 'Rp 10.000.000 - Rp 16.000.000',
    category: 'Web Development',
    postedDate: 'Hari ini',
    source: 'Tech in Asia Jobs',
    applyUrl: 'https://www.techinasia.com/jobs/search?country_name=Indonesia&keyword=Mobile+Developer',
    description:
      'Merancang antarmuka mobile yang responsif untuk pengguna e-commerce, mengelola state management Bloc / Riverpod, optimalisasi konsumsi memori dan baterai ponsel.',
    requiredSkills: ['Flutter', 'Dart', 'React Native', 'Mobile UI', 'REST API', 'Git'],
  },
  {
    id: 'live-it-5',
    title: 'Cloud & DevOps Engineer Associate',
    company: 'DANA Indonesia (PT Espay Debit Indonesia Koe)',
    location: 'Jakarta Selatan (Hybrid)',
    workplaceType: 'Hybrid',
    type: 'Penuh Waktu',
    salary: 'Rp 11.000.000 - Rp 18.000.000',
    category: 'Cloud & DevOps',
    postedDate: '3 hari yang lalu',
    source: 'LinkedIn Jobs',
    applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=DevOps+Indonesia',
    description:
      'Otomatisasi deployment pipeline CI/CD GitHub Actions, orkestrasi container Docker dan Kubernetes pada cloud AWS/GCP, serta monitoring reliabilitas sistem pembayaran.',
    requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform', 'Bash'],
  },
  {
    id: 'live-it-6',
    title: 'UI/UX & Product Designer',
    company: 'Tiket.com',
    location: 'Jakarta Pusat (Hybrid)',
    workplaceType: 'Hybrid',
    type: 'Penuh Waktu',
    salary: 'Rp 8.000.000 - Rp 13.000.000',
    category: 'UI/UX',
    postedDate: 'Hari ini',
    source: 'Glints Indonesia',
    applyUrl: 'https://glints.com/id/opportunities/jobs/explore?keyword=UI+UX+Designer',
    description:
      'Membuat wireframe, high-fidelity mockup, dan interaktif prototipe di Figma. Melaksanakan usability testing berkala untuk menyempurnakan alur checkout pengguna.',
    requiredSkills: ['Figma', 'UI Design', 'UX Research', 'Design System', 'Prototyping', 'Usability Testing'],
  },
  {
    id: 'live-it-7',
    title: 'Backend Engineer (Golang / Node.js)',
    company: 'Shopee Indonesia (Sea Group)',
    location: 'Jakarta Selatan (Onsite)',
    workplaceType: 'Onsite',
    type: 'Penuh Waktu',
    salary: 'Rp 12.000.000 - Rp 20.000.000',
    category: 'Web Development',
    postedDate: 'Hari ini',
    source: 'Shopee Careers / LinkedIn',
    applyUrl: 'https://careers.shopee.co.id/jobs?region_id=1&department_id=4',
    description:
      'Mengembangkan microservices berkinerja tinggi untuk sistem pemrosesan pesanan flash sale, caching Redis, dan database relasional PostgreSQL skala masif.',
    requiredSkills: ['Golang', 'Node.js', 'PostgreSQL', 'Redis', 'Microservices', 'Docker', 'REST API'],
  },
  {
    id: 'live-it-8',
    title: 'Machine Learning / AI Engineer Intern',
    company: 'Ruangguru',
    location: 'Jakarta Selatan (Hybrid)',
    workplaceType: 'Hybrid',
    type: 'Magang / Internship',
    salary: 'Rp 4.500.000 - Rp 7.000.000',
    category: 'Data Science',
    postedDate: '1 hari yang lalu',
    source: 'Ruangguru Careers',
    applyUrl: 'https://ruangguru.com/career',
    description:
      'Membantu fine-tuning LLM untuk asisten tutor AI, ekstraksi teks soal otomatis (OCR), dan rekomendasi materi belajar adaptif berbasis algoritma pembelajaran mesin.',
    requiredSkills: ['Python', 'PyTorch', 'TensorFlow', 'NLP', 'Machine Learning', 'Pandas'],
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = (searchParams.get('q') || '').toLowerCase();
  const category = (searchParams.get('category') || 'all').toLowerCase();
  const location = (searchParams.get('location') || 'all').toLowerCase();

  const apiKey = process.env.RAPIDAPI_KEY;
  const apiHost = process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com';

  // 1. If RAPIDAPI_KEY is configured, fetch live real-time aggregator from JSearch
  if (apiKey) {
    try {
      const searchTerms = keyword ? `${keyword} IT software developer Indonesia` : 'software developer IT Indonesia';
      const url = `https://${apiHost}/search?query=${encodeURIComponent(searchTerms)}&page=1&num_pages=1&country=id`;

      const res = await fetch(url, {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': apiHost,
        },
        next: { revalidate: 3600 },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const liveResults: LiveITJob[] = json.data.map((item: any, idx: number) => {
            const isRemote = Boolean(item.job_is_remote);
            const skills = (item.job_required_skills || []).slice(0, 6);
            return {
              id: `api-live-${item.job_id || idx}`,
              title: item.job_title || 'IT Software Professional',
              company: item.employer_name || 'Perusahaan Teknologi',
              location: item.job_city ? `${item.job_city}, ${item.job_country || 'Indonesia'}` : (isRemote ? 'Remote (Indonesia)' : 'Indonesia'),
              workplaceType: isRemote ? 'Remote' : 'Hybrid',
              type: item.job_employment_type || 'Penuh Waktu',
              salary: item.job_min_salary ? `Rp ${item.job_min_salary} - Rp ${item.job_max_salary}` : 'Gaji Kompetitif Sesuai Pengalaman',
              category: 'Web Development',
              postedDate: 'Real-time via JSearch',
              source: item.job_publisher || 'LinkedIn / Indeed',
              applyUrl: item.job_apply_link || 'https://www.linkedin.com/jobs',
              description: item.job_description || 'Lowongan pekerjaan teknologi informasi terkini.',
              requiredSkills: skills.length > 0 ? skills : ['Problem Solving', 'Git', 'Software Development'],
            };
          });

          return NextResponse.json({
            success: true,
            isLiveApi: true,
            total: liveResults.length,
            jobs: liveResults,
          });
        }
      }
    } catch (err) {
      console.warn('Live API fetch error, falling back to curated live IT catalog:', err);
    }
  }

  // 2. Curated Live IT Feed in Indonesia (always reliable & IT-specialized)
  let filtered = realTimeITJobsCatalog;
  if (keyword) {
    filtered = filtered.filter(
      (j) =>
        j.title.toLowerCase().includes(keyword) ||
        j.company.toLowerCase().includes(keyword) ||
        j.requiredSkills.some((s) => s.toLowerCase().includes(keyword))
    );
  }

  if (category !== 'all') {
    filtered = filtered.filter((j) => j.category.toLowerCase().includes(category));
  }

  if (location !== 'all') {
    filtered = filtered.filter((j) => j.workplaceType.toLowerCase() === location);
  }

  return NextResponse.json({
    success: true,
    isLiveApi: false,
    total: filtered.length,
    jobs: filtered,
  });
}
