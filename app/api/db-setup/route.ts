import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { circuits, circuitFaqs, drivers, riderStats, achievements, blogs, categories, blogCategories } from "@/lib/db/schema";

const MOCK_CIRCUITS = [
  {
    name: "Gilles Villeneuve Circuit",
    slug: "gilles-villeneuve",
    description: "A world-renowned motor racing circuit in Montreal, Quebec, Canada. It is the venue for the Formula One Canadian Grand Prix since 1978. Renowned for its challenging 'Wall of Champions' at the exit of the final chicane.",
    trackImage: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=800&auto=format&fit=crop",
    aboutImage: "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800&auto=format&fit=crop",
    galleryImages: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop",
    circuitLength: "4.361 km",
    firstGrandPrix: 1978,
    numberOfLaps: 70,
    fastestLapTime: "1:13.078",
    fastestLapDriver: "Valtteri Bottas",
    fastestLapYear: 2019,
    raceDistance: "305.270 km",
    faqs: [
      {
        question: "What is the Wall of Champions?",
        answer: "The final chicane barrier where many world champions (Schumacher, Hill, Villeneuve) have crashed."
      },
      {
        question: "Where is the circuit located?",
        answer: "On Notre Dame Island in Montreal, Quebec, Canada."
      }
    ]
  },
  {
    name: "Silverstone Circuit",
    slug: "silverstone",
    description: "The home of British Motor Racing. Silverstone is a legendary circuit with fast, sweeping corners like Copse, Becketts, and Chapel that test a driver's limits and physical endurance.",
    trackImage: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=800&auto=format&fit=crop",
    aboutImage: "https://images.unsplash.com/photo-1605558158312-9e7d1100e47f?q=80&w=800&auto=format&fit=crop",
    galleryImages: "https://images.unsplash.com/photo-1605558158312-9e7d1100e47f?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=600&auto=format&fit=crop",
    circuitLength: "5.891 km",
    firstGrandPrix: 1950,
    numberOfLaps: 52,
    fastestLapTime: "1:27.097",
    fastestLapDriver: "Max Verstappen",
    fastestLapYear: 2020,
    raceDistance: "306.198 km",
    faqs: [
      {
        question: "When did Silverstone host the first F1 race?",
        answer: "In 1950, which was the inaugural F1 World Championship race."
      },
      {
        question: "What are the most famous corners?",
        answer: "Copse, Maggots, Becketts, and Chapel."
      }
    ]
  },
  {
    name: "Circuit de Monaco",
    slug: "monaco",
    description: "A street circuit laid out on the city streets of Monte Carlo and La Condamine around the harbor of the Principality of Monaco. It is widely considered one of the most prestigious and demanding tracks in motorsport.",
    trackImage: "/f1_track_layout.png",
    aboutImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop",
    galleryImages: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1527058989700-159e22e41d8b?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=600&auto=format&fit=crop",
    circuitLength: "3.337 km",
    firstGrandPrix: 1950,
    numberOfLaps: 78,
    fastestLapTime: "1:12.909",
    fastestLapDriver: "Lewis Hamilton",
    fastestLapYear: 2021,
    raceDistance: "260.286 km",
    faqs: [
      {
        question: "Why is qualifying so critical in Monaco?",
        answer: "Because the streets are extremely narrow, making overtaking nearly impossible during the race."
      },
      {
        question: "What is the slowest corner in F1?",
        answer: "The Grand Hotel Hairpin (formerly Fairmont Hairpin), taken at around 48 km/h."
      }
    ]
  },
  {
    name: "Autodromo Nazionale Monza",
    slug: "monza",
    description: "Known as the 'Temple of Speed', Monza is the oldest purpose-built motor racing circuit in mainland Europe. It features long straights and fast corners where drivers spend most of the lap at full throttle.",
    trackImage: "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=800&auto=format&fit=crop",
    aboutImage: "https://images.unsplash.com/photo-1562591176-74950fa26135?q=80&w=800&auto=format&fit=crop",
    galleryImages: "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=600&auto=format&fit=crop",
    circuitLength: "5.793 km",
    firstGrandPrix: 1950,
    numberOfLaps: 53,
    fastestLapTime: "1:21.046",
    fastestLapDriver: "Rubens Barrichello",
    fastestLapYear: 2004,
    raceDistance: "306.720 km",
    faqs: [
      {
        question: "Why is Monza called the Temple of Speed?",
        answer: "Because it has the highest average speed of any F1 circuit, reaching over 350 km/h on the straights."
      },
      {
        question: "Who are the Tifosi?",
        answer: "The extremely passionate Italian fans who support Scuderia Ferrari."
      }
    ]
  },
  {
    name: "Circuit de Spa-Francorchamps",
    slug: "spa-francorchamps",
    description: "Lauded by drivers as one of their absolute favorite tracks in the world. Spa is a magnificent, fast, and flowing circuit nestled in the hilly Ardennes countryside, featuring the legendary Eau Rouge-Raidillon compression.",
    trackImage: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800&auto=format&fit=crop",
    aboutImage: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800&auto=format&fit=crop",
    galleryImages: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=600&auto=format&fit=crop",
    circuitLength: "7.004 km",
    firstGrandPrix: 1950,
    numberOfLaps: 44,
    fastestLapTime: "1:46.286",
    fastestLapDriver: "Valtteri Bottas",
    fastestLapYear: 2018,
    raceDistance: "308.052 km",
    faqs: [
      {
        question: "What is the most famous corner at Spa?",
        answer: "Eau Rouge and Raidillon, a high-speed compression and steep uphill blind climb."
      },
      {
        question: "Why is the weather so unpredictable?",
        answer: "Due to the microclimate of the Ardennes hills, it can be dry on one part of the track and raining heavily on another."
      }
    ]
  }
];

const MOCK_DRIVERS = [
  { id: "george-russell", firstName: "George", lastName: "Russell", team: "Mercedes", number: "63", country: "Great Britain", flagCode: "GB" },
  { id: "kimi-antonelli", firstName: "Kimi", lastName: "Antonelli", team: "Mercedes", number: "12", country: "Italy", flagCode: "IT" },
  { id: "charles-leclerc", firstName: "Charles", lastName: "Leclerc", team: "Ferrari", number: "16", country: "Monaco", flagCode: "MC" },
  { id: "lewis-hamilton", firstName: "Lewis", lastName: "Hamilton", team: "Ferrari", number: "44", country: "Great Britain", flagCode: "GB" },
  { id: "lando-norris", firstName: "Lando", lastName: "Norris", team: "McLaren", number: "4", country: "Great Britain", flagCode: "GB" },
  { id: "oscar-piastri", firstName: "Oscar", lastName: "Piastri", team: "McLaren", number: "81", country: "Australia", flagCode: "AU" },
  { id: "max-verstappen", firstName: "Max", lastName: "Verstappen", team: "Red Bull Racing", number: "1", country: "Netherlands", flagCode: "NL" },
  { id: "isack-hadjar", firstName: "Isack", lastName: "Hadjar", team: "Red Bull Racing", number: "9", country: "France", flagCode: "FR" },
  { id: "pierre-gasly", firstName: "Pierre", lastName: "Gasly", team: "Alpine", number: "10", country: "France", flagCode: "FR" },
  { id: "franco-colapinto", firstName: "Franco", lastName: "Colapinto", team: "Alpine", number: "43", country: "Argentina", flagCode: "AR" },
  { id: "esteban-ocon", firstName: "Esteban", lastName: "Ocon", team: "Haas F1 Team", number: "31", country: "France", flagCode: "FR" },
  { id: "oliver-bearman", firstName: "Oliver", lastName: "Bearman", team: "Haas F1 Team", number: "87", country: "Great Britain", flagCode: "GB" },
  { id: "liam-lawson", firstName: "Liam", lastName: "Lawson", team: "Racing Bulls", number: "30", country: "New Zealand", flagCode: "NZ" },
  { id: "arvid-lindblad", firstName: "Arvid", lastName: "Lindblad", team: "Racing Bulls", number: "88", country: "Great Britain", flagCode: "GB" },
  { id: "carlos-sainz", firstName: "Carlos", lastName: "Sainz", team: "Williams", number: "55", country: "Spain", flagCode: "ES" },
  { id: "alexander-albon", firstName: "Alexander", lastName: "Albon", team: "Williams", number: "23", country: "Thailand", flagCode: "TH" },
  { id: "nico-hulkenberg", firstName: "Nico", lastName: "Hulkenberg", team: "Audi", number: "27", country: "Germany", flagCode: "DE" },
  { id: "gabriel-bortoleto", firstName: "Gabriel", lastName: "Bortoleto", team: "Audi", number: "5", country: "Brazil", flagCode: "BR" },
  { id: "sergio-perez", firstName: "Sergio", lastName: "Perez", team: "Cadillac", number: "11", country: "Mexico", flagCode: "MX" },
  { id: "valtteri-bottas", firstName: "Valtteri", lastName: "Bottas", team: "Cadillac", number: "77", country: "Finland", flagCode: "FI" },
  { id: "fernando-alonso", firstName: "Fernando", lastName: "Alonso", team: "Aston Martin", number: "14", country: "Spain", flagCode: "ES" },
  { id: "lance-stroll", firstName: "Lance", lastName: "Stroll", team: "Aston Martin", number: "18", country: "Canada", flagCode: "CA" }
];

export async function GET() {
  const steps: string[] = [];
  try {
    steps.push("Initializing database setup...");

    // 1. CREATE TABLES ONE-BY-ONE
    const createTableQueries = [
      `CREATE TABLE IF NOT EXISTS \`blogs\` (
        \`id\` varchar(191) NOT NULL,
        \`title\` text NOT NULL,
        \`slug\` varchar(191) NOT NULL,
        \`content\` longtext NOT NULL,
        \`excerpt\` text,
        \`featured_image\` text,
        \`author\` varchar(191),
        \`published\` boolean NOT NULL DEFAULT false,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`blogs_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`blogs_slug_unique\` UNIQUE(\`slug\`)
      );`,
      
      `CREATE TABLE IF NOT EXISTS \`drivers\` (
        \`id\` varchar(191) NOT NULL,
        \`full_name\` text NOT NULL,
        \`first_name\` varchar(100),
        \`last_name\` varchar(100),
        \`dob\` varchar(100),
        \`other_name\` text,
        \`slug\` varchar(191) NOT NULL,
        \`racing_category\` varchar(100),
        \`years_active\` int,
        \`total_races\` int,
        \`total_wins\` int,
        \`total_podiums\` int,
        \`best_career_finish\` text,
        \`championships_won\` text,
        \`current_team\` text,
        \`previous_teams\` text,
        \`sponsor_details\` text,
        \`team_color\` varchar(20),
        \`accessible_color\` varchar(20),
        \`number\` varchar(10),
        \`image\` text,
        \`number_image\` text,
        \`flag_code\` varchar(10),
        \`country\` varchar(100),
        \`vehicle_model\` text,
        \`engine_capacity\` varchar(50),
        \`vehicle_class\` varchar(100),
        \`chassis_number\` varchar(100),
        \`livery_scheme\` text,
        \`status\` varchar(20) DEFAULT 'pending',
        \`player_type\` varchar(20) DEFAULT 'driver',
        \`career_points\` varchar(50),
        \`career_poles\` int,
        \`biography\` longtext,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`drivers_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`drivers_slug_unique\` UNIQUE(\`slug\`)
      );`,
      
      `CREATE TABLE IF NOT EXISTS \`achievements\` (
        \`id\` varchar(191) NOT NULL,
        \`driver_id\` varchar(191) NOT NULL,
        \`race_name\` text NOT NULL,
        \`year\` int,
        \`date\` varchar(100),
        \`team\` varchar(100),
        \`position\` varchar(50),
        \`points\` int,
        \`category\` varchar(100),
        CONSTRAINT \`achievements_id\` PRIMARY KEY(\`id\`)
      );`,

      `CREATE TABLE IF NOT EXISTS \`rider_stats\` (
        \`id\` varchar(191) NOT NULL,
        \`driver_id\` varchar(191) NOT NULL,
        \`season\` int,
        \`category\` varchar(100),
        \`bike\` varchar(100),
        \`starts\` int,
        \`poles\` int,
        \`first_pos\` int,
        \`second_pos\` int,
        \`third_pos\` int,
        \`podiums\` int,
        \`points\` int,
        \`position\` varchar(50),
        \`fastest_laps\` int,
        \`dnfs\` int,
        \`sprint_races\` int,
        \`sprint_points\` int,
        \`sprint_wins\` int,
        \`sprint_podiums\` int,
        \`sprint_poles\` int,
        CONSTRAINT \`rider_stats_id\` PRIMARY KEY(\`id\`)
      );`,

      `CREATE TABLE IF NOT EXISTS \`circuits\` (
        \`id\` varchar(191) NOT NULL,
        \`name\` text NOT NULL,
        \`slug\` varchar(191) NOT NULL,
        \`description\` longtext,
        \`track_image\` text,
        \`about_image\` text,
        \`gallery_images\` text,
        \`circuit_length\` varchar(50),
        \`first_grand_prix\` int,
        \`number_of_laps\` int,
        \`fastest_lap_time\` varchar(50),
        \`fastest_lap_driver\` varchar(191),
        \`fastest_lap_year\` int,
        \`race_distance\` varchar(50),
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`circuits_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`circuits_slug_unique\` UNIQUE(\`slug\`)
      );`,

      `CREATE TABLE IF NOT EXISTS \`circuit_faqs\` (
        \`id\` varchar(191) NOT NULL,
        \`circuit_id\` varchar(191) NOT NULL,
        \`question\` text NOT NULL,
        \`answer\` text NOT NULL,
        CONSTRAINT \`circuit_faqs_id\` PRIMARY KEY(\`id\`)
      );`,

      `CREATE TABLE IF NOT EXISTS \`categories\` (
        \`id\` varchar(191) NOT NULL,
        \`name\` varchar(100) NOT NULL,
        \`slug\` varchar(191) NOT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`categories_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`categories_name_unique\` UNIQUE(\`name\`),
        CONSTRAINT \`categories_slug_unique\` UNIQUE(\`slug\`)
      );`,

      `CREATE TABLE IF NOT EXISTS \`blog_categories\` (
        \`blog_id\` varchar(191) NOT NULL,
        \`category_id\` varchar(191) NOT NULL,
        CONSTRAINT \`blog_categories_pk\` PRIMARY KEY(\`blog_id\`, \`category_id\`)
      );`,

      `CREATE TABLE IF NOT EXISTS \`comments\` (
        \`id\` varchar(191) NOT NULL,
        \`blog_id\` varchar(191) NOT NULL,
        \`user_id\` varchar(191) NOT NULL,
        \`content\` text NOT NULL,
        \`approved\` boolean NOT NULL DEFAULT false,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`comments_id\` PRIMARY KEY(\`id\`)
      );`
    ];

    for (const q of createTableQueries) {
      await db.execute(sql.raw(q));
    }
    
    // Migrate existing drivers table if the columns don't exist yet
    try {
      await db.execute(sql.raw("ALTER TABLE `drivers` ADD COLUMN IF NOT EXISTS `player_type` varchar(20) DEFAULT 'driver';"));
      await db.execute(sql.raw("ALTER TABLE `drivers` ADD COLUMN IF NOT EXISTS `career_points` varchar(50);"));
      await db.execute(sql.raw("ALTER TABLE `drivers` ADD COLUMN IF NOT EXISTS `career_poles` int;"));
      await db.execute(sql.raw("ALTER TABLE `drivers` ADD COLUMN IF NOT EXISTS `biography` longtext;"));
      steps.push("Database schema migrations executed successfully!");
    } catch (migErr) {
      console.warn("Migration warning (might be already applied or unsupported syntax):", migErr);
    }

    steps.push("Successfully verified or created all database tables!");

    // 2. SEED BLOGS IF EMPTY
    const existingBlogs = await db.select().from(blogs).limit(1);
    if (existingBlogs.length === 0) {
      await db.insert(blogs).values({
        id: crypto.randomUUID(),
        title: "Welcome to Speedmania!",
        slug: "welcome-to-speedmania",
        content: "<p>We are thrilled to welcome you to the home of high-speed racing updates. Explore tracks, driver standings, and motorsport updates!</p>",
        excerpt: "The ultimate racing platform is live.",
        featuredImage: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=800&auto=format&fit=crop",
        author: "Admin",
        published: true
      });
      steps.push("Seeded welcome blog post.");
    }

    // 2b. SEED DEFAULT CATEGORIES IF EMPTY
    const existingCats = await db.select().from(categories).limit(1);
    if (existingCats.length === 0) {
      const defaultCategories = [
        { name: "Formula 1", slug: "formula-1" },
        { name: "MotoGP", slug: "motogp" },
        { name: "Sri Lanka Racing", slug: "sri-lanka-racing" },
        { name: "Editor's Pick", slug: "editors-pick" },
      ];
      for (const cat of defaultCategories) {
        await db.insert(categories).values({
          id: crypto.randomUUID(),
          name: cat.name,
          slug: cat.slug,
        });
      }
      steps.push("Seeded default racing and editor categories.");
    }

    // 3. SEED DRIVERS IF EMPTY
    const existingDrivers = await db.select().from(drivers).limit(1);
    if (existingDrivers.length === 0) {
      steps.push("Seeding drivers and stats...");
      for (const d of MOCK_DRIVERS) {
        const driverId = crypto.randomUUID();
        await db.insert(drivers).values({
          id: driverId,
          fullName: `${d.firstName} ${d.lastName}`,
          firstName: d.firstName,
          lastName: d.lastName,
          slug: d.id,
          currentTeam: d.team,
          number: d.number,
          country: d.country,
          flagCode: d.flagCode,
          status: "approved",
          racingCategory: "Formula 1",
          yearsActive: 5,
          totalRaces: 100,
          totalWins: 5,
          totalPodiums: 15,
        });

        // Add 2026 stats
        await db.insert(riderStats).values({
          driverId,
          season: 2026,
          category: "Formula 1",
          starts: 4,
          points: d.id === "george-russell" ? 80 : 45,
          position: d.id === "george-russell" ? "2nd" : "5th",
          firstPos: d.id === "george-russell" ? 1 : 0,
          podiums: d.id === "george-russell" ? 2 : 1,
          poles: d.id === "george-russell" ? 1 : 0,
          dnfs: 0,
          sprintRaces: 2,
          sprintPoints: d.id === "george-russell" ? 13 : 5,
          sprintWins: d.id === "george-russell" ? 1 : 0,
          sprintPodiums: d.id === "george-russell" ? 1 : 0,
          sprintPoles: d.id === "george-russell" ? 1 : 0,
        });

        // Add achievements
        const results = [
          { race: "Australia", date: "08 Mar", pos: "4", pts: 12 },
          { race: "China", date: "15 Mar", pos: "5", pts: 10 },
          { race: "Japan", date: "29 Mar", pos: "6", pts: 8 },
        ];
        for (const res of results) {
          await db.insert(achievements).values({
            id: crypto.randomUUID(),
            driverId,
            raceName: res.race,
            date: res.date,
            year: 2026,
            team: d.team,
            position: res.pos,
            points: res.pts,
            category: "Formula 1"
          });
        }
      }
      steps.push(`Successfully seeded ${MOCK_DRIVERS.length} drivers, stats, and achievements!`);
    }

    // 4. SEED CIRCUITS IF EMPTY
    const existingCircuits = await db.select().from(circuits).limit(1);
    if (existingCircuits.length === 0) {
      steps.push("Seeding circuits and FAQs...");
      for (const c of MOCK_CIRCUITS) {
        const { faqs, ...circuitData } = c;
        const circuitId = crypto.randomUUID();

        await db.insert(circuits).values({
          id: circuitId,
          ...circuitData,
        });

        if (faqs && faqs.length > 0) {
          await db.insert(circuitFaqs).values(
            faqs.map(f => ({
              id: crypto.randomUUID(),
              circuitId,
              question: f.question,
              answer: f.answer,
            }))
          );
        }
      }
      steps.push(`Successfully seeded ${MOCK_CIRCUITS.length} circuits and FAQs!`);
    }

    steps.push("Database setup completed successfully!");
    return NextResponse.json({ success: true, steps });
  } catch (error: any) {
    console.error("[DB_SETUP_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || error, steps },
      { status: 500 }
    );
  }
}
