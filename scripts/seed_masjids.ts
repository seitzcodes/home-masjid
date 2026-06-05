import postgres from 'postgres';

const sql = postgres({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.mwxcokklqsrxjlcrendq',
  password: 'fyP%kjwbQK9K5p&'
});

const masjids = [
  {
    name: "Nizamiye Mosque",
    description: "The largest mosque in the Southern Hemisphere, modeled after the Selimiye Mosque in Edirne, Turkey.",
    address: "Corner of Old Pretoria Road and Le Roux Avenue",
    city: "Midrand",
    country: "South Africa",
    gps_location: "POINT(28.1283 -26.0028)",
    is_verified: true,
  },
  {
    name: "Juma Masjid",
    description: "Also known as the Grey Street Mosque, it is one of the oldest and largest mosques in the Southern Hemisphere.",
    address: "Grey Street (Dr Yusuf Dadoo St) and Queen Street (Denis Hurley St)",
    city: "Durban",
    country: "South Africa",
    gps_location: "POINT(31.0181 -29.8561)",
    is_verified: true,
  },
  {
    name: "Auwal Mosque",
    description: "The first and oldest mosque in South Africa, established in 1794 in the Bo-Kaap neighborhood.",
    address: "43 Dorp St, Schotsche Kloof",
    city: "Cape Town",
    country: "South Africa",
    gps_location: "POINT(18.4162 -33.9238)",
    is_verified: true,
  },
  {
    name: "Habibia Soofie Saheb Masjid",
    description: "A prominent mosque and Islamic center located in the Rylands area.",
    address: "Klipfontein Rd, Rylands",
    city: "Cape Town",
    country: "South Africa",
    gps_location: "POINT(18.5133 -33.9678)",
    is_verified: true,
  },
  {
    name: "Riverside Mosque (Soofie Masjid)",
    description: "A historic mosque situated on the banks of the Umgeni River.",
    address: "Lower Bridge Road, Riverside",
    city: "Durban",
    country: "South Africa",
    gps_location: "POINT(31.0264 -29.8055)",
    is_verified: true,
  },
  {
    name: "Ahmadiyya Mosque",
    description: "One of the older mosques serving the local Muslim community in the Bo-Kaap.",
    address: "Longmarket St, Schotsche Kloof",
    city: "Cape Town",
    country: "South Africa",
    gps_location: "POINT(18.4144 -33.9200)",
    is_verified: false,
  },
  {
    name: "Masjidul Quds",
    description: "A vibrant, modern mosque in the heart of the Gatesville community.",
    address: "1 Balu Parker Blvd, Gatesville",
    city: "Cape Town",
    country: "South Africa",
    gps_location: "POINT(18.5295 -33.9642)",
    is_verified: true,
  },
  {
    name: "Kerk Street Mosque (Juma Masjid)",
    description: "A prominent place of worship serving the inner-city Muslim community.",
    address: "Corner Kerk and Goud Streets",
    city: "Johannesburg",
    country: "South Africa",
    gps_location: "POINT(28.0503 -26.1989)",
    is_verified: true,
  },
  {
    name: "Houghton Mosque (Masjid-e-Furqaan)",
    description: "A large community mosque with extensive educational facilities.",
    address: "2nd Ave, Houghton Estate",
    city: "Johannesburg",
    country: "South Africa",
    gps_location: "POINT(28.0541 -26.1558)",
    is_verified: true,
  },
  {
    name: "PMB Mosque (Habibia Soofie)",
    description: "A historic masjid complex serving the KwaZulu-Natal midlands.",
    address: "East St",
    city: "Pietermaritzburg",
    country: "South Africa",
    gps_location: "POINT(30.3831 -29.6015)",
    is_verified: true,
  },
  {
    name: "Port Elizabeth Jumuah Masjid",
    description: "The main Friday mosque for the Muslim community in Gqeberha.",
    address: "Grace St, Central",
    city: "Gqeberha",
    country: "South Africa",
    gps_location: "POINT(25.6226 -33.9608)",
    is_verified: true,
  },
  {
    name: "Zeerust Mosque",
    description: "One of the oldest mosques in the North West province, showcasing beautiful heritage architecture.",
    address: "Church St",
    city: "Zeerust",
    country: "South Africa",
    gps_location: "POINT(26.0759 -25.5393)",
    is_verified: false,
  },
  {
    name: "Bosmont Masjid",
    description: "A cornerstone of the Muslim community in the western suburbs of Johannesburg.",
    address: "Bosmont",
    city: "Johannesburg",
    country: "South Africa",
    gps_location: "POINT(27.9542 -26.1834)",
    is_verified: true,
  },
  {
    name: "Mayfair Juma Masjid",
    description: "A bustling mosque situated in one of Johannesburg's most prominent Muslim hubs.",
    address: "Mayfair",
    city: "Johannesburg",
    country: "South Africa",
    gps_location: "POINT(28.0064 -26.2025)",
    is_verified: true,
  },
  {
    name: "Zeenatul Islam Mosque",
    description: "Known affectionately as Muir Street Mosque, it is historically significant in District Six.",
    address: "Muir St, District Six",
    city: "Cape Town",
    country: "South Africa",
    gps_location: "POINT(18.4312 -33.9310)",
    is_verified: true,
  },
  {
    name: "Nurul Islam Mosque",
    description: "Founded in 1844, it was the third mosque established in South Africa.",
    address: "134 Buitengracht St",
    city: "Cape Town",
    country: "South Africa",
    gps_location: "POINT(18.4136 -33.9213)",
    is_verified: false,
  },
  {
    name: "Crosby Masjid (Masjid-ur-Rahmah)",
    description: "A welcoming community mosque serving the Crosby area.",
    address: "Crosby",
    city: "Johannesburg",
    country: "South Africa",
    gps_location: "POINT(27.9856 -26.1931)",
    is_verified: true,
  },
  {
    name: "Westville Soofie Masjid",
    description: "A beautifully maintained mosque complex serving the western suburbs of Durban.",
    address: "Westville",
    city: "Durban",
    country: "South Africa",
    gps_location: "POINT(30.9324 -29.8299)",
    is_verified: true,
  },
  {
    name: "Claremont Main Road Mosque",
    description: "A historic mosque known for its active role in community and social justice initiatives.",
    address: "Main Rd, Claremont",
    city: "Cape Town",
    country: "South Africa",
    gps_location: "POINT(18.4651 -33.9806)",
    is_verified: true,
  },
  {
    name: "Lenasia Juma Masjid",
    description: "One of the primary mosques serving the large Muslim population in Lenasia.",
    address: "Lenasia",
    city: "Johannesburg",
    country: "South Africa",
    gps_location: "POINT(27.8385 -26.3211)",
    is_verified: true,
  }
];

async function seed() {
  console.log("Seeding Masjids...");
  for (const m of masjids) {
    try {
      await sql`
        INSERT INTO home_masjid.masjids (name, description, address, city, country, gps_location, is_verified)
        VALUES (${m.name}, ${m.description}, ${m.address}, ${m.city}, ${m.country}, ${m.gps_location}, ${m.is_verified})
        ON CONFLICT DO NOTHING
      `;
      console.log(`Successfully seeded ${m.name}`);
    } catch (err: any) {
      console.error(`Error inserting ${m.name}:`, err.message);
    }
  }
  console.log("Done!");
  process.exit(0);
}

seed();
