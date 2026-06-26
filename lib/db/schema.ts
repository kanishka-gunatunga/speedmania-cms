import { mysqlTable, varchar, text, boolean, timestamp, longtext, int, primaryKey, unique, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// BLOGS TABLE
export const blogs = mysqlTable("blogs", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  slug: varchar("slug", { length: 191 }).notNull().unique(),
  content: longtext("content").notNull(),
  excerpt: text("excerpt"),
  featuredImage: text("featured_image"),
  author: varchar("author", { length: 191 }),
  authorId: varchar("author_id", { length: 191 }),
  published: boolean("published").notNull().default(false),
  seoMeta: json("seo_meta"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().onUpdateNow().defaultNow(),
});

// CATEGORIES TABLE
export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 191 }).notNull(),
  parentId: varchar("parent_id", { length: 191 }),
  type: varchar("type", { length: 50 }).notNull().default("blog"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().onUpdateNow().defaultNow(),
}, (table) => [
  unique("categories_name_type_unique").on(table.name, table.type),
  unique("categories_slug_type_unique").on(table.slug, table.type),
]);

// BLOG CATEGORIES JUNCTION TABLE
export const blogCategories = mysqlTable("blog_categories", {
  blogId: varchar("blog_id", { length: 191 }).notNull(),
  categoryId: varchar("category_id", { length: 191 }).notNull(),
}, (table) => [
  primaryKey({ columns: [table.blogId, table.categoryId] })
]);

// CIRCUIT CATEGORIES JUNCTION TABLE
export const circuitCategories = mysqlTable("circuit_categories", {
  circuitId: varchar("circuit_id", { length: 191 }).notNull(),
  categoryId: varchar("category_id", { length: 191 }).notNull(),
}, (table) => [
  primaryKey({ columns: [table.circuitId, table.categoryId] })
]);


// TEAM CATEGORIES JUNCTION TABLE
export const teamCategories = mysqlTable("team_categories", {
  teamId: varchar("team_id", { length: 191 }).notNull(),
  categoryId: varchar("category_id", { length: 191 }).notNull(),
}, (table) => [
  primaryKey({ columns: [table.teamId, table.categoryId] })
]);

// DRIVERS TABLE
export const drivers = mysqlTable("drivers", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  fullName: text("full_name").notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  dob: varchar("dob", { length: 100 }),
  otherName: text("other_name"),
  slug: varchar("slug", { length: 191 }).notNull().unique(),

  // Motorsport Background
  racingCategory: varchar("racing_category", { length: 100 }),
  yearsActive: int("years_active"),
  totalRaces: int("total_races"),
  totalWins: int("total_wins"),
  totalPodiums: int("total_podiums"),
  bestCareerFinish: text("best_career_finish"),
  championshipsWon: text("championships_won"),
  
  // Team Information
  currentTeam: text("current_team"),
  previousTeams: text("previous_teams"),
  sponsorDetails: text("sponsor_details"),
  
  // F1 Specific
  teamColor: varchar("team_color", { length: 20 }),
  accessibleColor: varchar("accessible_color", { length: 20 }),
  number: varchar("number", { length: 10 }),
  image: text("image"),
  bannerImage: text("banner_image"),
  numberImage: text("number_image"),
  flagCode: varchar("flag_code", { length: 10 }),
  country: varchar("country", { length: 100 }),

  // Vehicle Information
  vehicleModel: text("vehicle_model"),
  engineCapacity: varchar("engine_capacity", { length: 50 }),
  vehicleClass: varchar("vehicle_class", { length: 100 }),
  chassisNumber: varchar("chassis_number", { length: 100 }),
  liveryScheme: text("livery_scheme"),
  status: varchar("status", { length: 20 }).default("pending"),
  playerType: varchar("player_type", { length: 20 }).default("driver"),
  careerPoints: varchar("career_points", { length: 50 }),
  careerPoles: int("career_poles"),
  biography: longtext("biography"),
  biographyImage: text("biography_image"),
  userId: varchar("user_id", { length: 191 }),
  pendingChanges: longtext("pending_changes"),
  teamId: varchar("team_id", { length: 191 }),
  seoMeta: json("seo_meta"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().onUpdateNow().defaultNow(),
});

// ACHIEVEMENTS TABLE
export const achievements = mysqlTable("achievements", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  driverId: varchar("driver_id", { length: 191 }).notNull(),
  raceName: text("race_name").notNull(),
  year: int("year"),
  date: varchar("date", { length: 100 }),
  team: varchar("team", { length: 100 }),
  position: varchar("position", { length: 50 }),
  points: int("points"),
  category: varchar("category", { length: 100 }),
});

// RIDER STATS TABLE
export const riderStats = mysqlTable("rider_stats", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  driverId: varchar("driver_id", { length: 191 }).notNull(),
  season: int("season"),
  category: varchar("category", { length: 100 }),
  bike: varchar("bike", { length: 100 }),
  starts: int("starts"),
  poles: int("poles"),
  firstPos: int("first_pos"),
  secondPos: int("second_pos"),
  thirdPos: int("third_pos"),
  podiums: int("podiums"),
  points: int("points"),
  position: varchar("position", { length: 50 }),
  
  // Extra F1 Stats
  fastestLaps: int("fastest_laps"),
  dnfs: int("dnfs"),
  sprintRaces: int("sprint_races"),
  sprintPoints: int("sprint_points"),
  sprintWins: int("sprint_wins"),
  sprintPodiums: int("sprint_podiums"),
  sprintPoles: int("sprint_poles"),
});

// CIRCUITS TABLE
export const circuits = mysqlTable("circuits", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 191 }).notNull().unique(),
  description: longtext("description"),
  trackImage: text("track_image"),
  aboutImage: text("about_image"),
  galleryImages: text("gallery_images"),
  circuitLength: varchar("circuit_length", { length: 50 }),
  firstGrandPrix: int("first_grand_prix"),
  numberOfLaps: int("number_of_laps"),
  fastestLapTime: varchar("fastest_lap_time", { length: 50 }),
  fastestLapDriver: varchar("fastest_lap_driver", { length: 191 }),
  fastestLapYear: int("fastest_lap_year"),
  raceDistance: varchar("race_distance", { length: 50 }),
  racingCategory: varchar("racing_category", { length: 100 }),
  seoMeta: json("seo_meta"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().onUpdateNow().defaultNow(),
});

// CIRCUIT FAQS TABLE
export const circuitFaqs = mysqlTable("circuit_faqs", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  circuitId: varchar("circuit_id", { length: 191 }).notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
});

// RELATIONS
export const blogsRelations = relations(blogs, ({ many, one }) => ({
  blogCategories: many(blogCategories),
  comments: many(comments),
  authorProfile: one(authorProfiles, {
    fields: [blogs.authorId],
    references: [authorProfiles.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  blogCategories: many(blogCategories),
  circuitCategories: many(circuitCategories),
  teamCategories: many(teamCategories),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
}));

export const blogCategoriesRelations = relations(blogCategories, ({ one }) => ({
  blog: one(blogs, {
    fields: [blogCategories.blogId],
    references: [blogs.id],
  }),
  category: one(categories, {
    fields: [blogCategories.categoryId],
    references: [categories.id],
  }),
}));

export const driversRelations = relations(drivers, ({ many, one }) => ({
  achievements: many(achievements),
  riderStats: many(riderStats),
  user: one(users, {
    fields: [drivers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [drivers.teamId],
    references: [teams.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  driver: one(drivers, {
    fields: [achievements.driverId],
    references: [drivers.id],
  }),
}));

export const riderStatsRelations = relations(riderStats, ({ one }) => ({
  driver: one(drivers, {
    fields: [riderStats.driverId],
    references: [drivers.id],
  }),
}));

export const circuitsRelations = relations(circuits, ({ many }) => ({
  faqs: many(circuitFaqs),
  circuitCategories: many(circuitCategories),
}));

export const circuitCategoriesRelations = relations(circuitCategories, ({ one }) => ({
  circuit: one(circuits, {
    fields: [circuitCategories.circuitId],
    references: [circuits.id],
  }),
  category: one(categories, {
    fields: [circuitCategories.categoryId],
    references: [categories.id],
  }),
}));

export const circuitFaqsRelations = relations(circuitFaqs, ({ one }) => ({
  circuit: one(circuits, {
    fields: [circuitFaqs.circuitId],
    references: [circuits.id],
  }),
}));

export const teamCategoriesRelations = relations(teamCategories, ({ one }) => ({
  team: one(teams, {
    fields: [teamCategories.teamId],
    references: [teams.id],
  }),
  category: one(categories, {
    fields: [teamCategories.categoryId],
    references: [categories.id],
  }),
}));

// TEAMS TABLE
export const teams = mysqlTable("teams", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 255 }),
  slug: varchar("slug", { length: 191 }).notNull().unique(),
  category: varchar("category", { length: 100 }), // Deprecated: use team_categories relation instead
  logo: text("logo"), // image URL or "shield"
  initials: varchar("initials", { length: 10 }),
  gradient: text("gradient"),
  textColor: varchar("text_color", { length: 50 }).default("text-white"),
  accentColor: varchar("accent_color", { length: 50 }),
  memberCardBg: varchar("member_card_bg", { length: 50 }),
  glowColor: varchar("glow_color", { length: 50 }),
  biography: longtext("biography"),
  profileImage: text("profile_image"),
  
  // Season Stats (2026 Season)
  seasonPosition: varchar("season_position", { length: 50 }),
  seasonPoints: int("season_points"),
  races: int("races"),
  wins: int("wins"),
  fastestLaps: int("fastest_laps"),
  podiums: int("podiums"),
  sprintRaces: int("sprint_races"),
  sprintPoints: int("sprint_points"),
  sprintWins: int("sprint_wins"),
  sprintPodiums: int("sprint_podiums"),
  
  // Team Summary (All Time)
  summaryEntered: int("summary_entered"),
  summaryWins: varchar("summary_wins", { length: 50 }),
  highestFinish: varchar("highest_finish", { length: 100 }),
  summaryPodiums: int("summary_podiums"),
  summaryPoles: int("summary_poles"),
  summaryChampionships: int("summary_championships"),
  
  // Custom Roster (JSON stringified)
  roster: longtext("roster"),
  
  seoMeta: json("seo_meta"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().onUpdateNow().defaultNow(),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  drivers: many(drivers),
  teamCategories: many(teamCategories),
}));

// USERS TABLE
export const users = mysqlTable("users", {
  id: varchar("id", { length: 191 }).primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }),
  otp: varchar("otp", { length: 10 }),
  otpExpiry: timestamp("otp_expiry"),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).default("admin"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().onUpdateNow().defaultNow(),
});

// COMMENTS TABLE
export const comments = mysqlTable("comments", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  blogId: varchar("blog_id", { length: 191 }).notNull(),
  userId: varchar("user_id", { length: 191 }).notNull(),
  content: text("content").notNull(),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().onUpdateNow().defaultNow(),
});

// COMMENTS RELATIONS
export const commentsRelations = relations(comments, ({ one }) => ({
  blog: one(blogs, {
    fields: [comments.blogId],
    references: [blogs.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  comments: many(comments),
  driver: one(drivers, {
    fields: [users.id],
    references: [drivers.userId],
  }),
  authorProfile: one(authorProfiles, {
    fields: [users.id],
    references: [authorProfiles.userId],
  }),
}));

// SLADA PAGE CONTENT TABLE
export const sladaPage = mysqlTable("slada_page", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => "1"),
  logoUrl: text("logo_url").notNull().default("/slada-logo.png"),
  aboutTitle: text("about_title").notNull().default("About SLADA"),
  aboutImageUrl: text("about_image_url").notNull().default("/slada-bio.png"),
  aboutDescription: longtext("about_description").notNull(),
  committeeTitle: text("committee_title").notNull().default("SLADA Committee (2026/2027)"),
  committeeDescription: text("committee_description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().onUpdateNow().defaultNow(),
});

// SLADA COMMITTEE MEMBERS TABLE
export const sladaCommittee = mysqlTable("slada_committee", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  bgPosition: varchar("bg_position", { length: 100 }).default("0% 0%"),
  image: text("image"), // custom uploaded image URL
  displayOrder: int("display_order").notNull().default(0),
  category: varchar("category", { length: 50 }).notNull().default("slada"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().onUpdateNow().defaultNow(),
});

// AUTHOR PROFILES TABLE
export const authorProfiles = mysqlTable("author_profiles", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 191 }),
  fullName: text("full_name").notNull(),
  bio: longtext("bio"),
  avatarUrl: text("avatar_url"),
  slug: varchar("slug", { length: 191 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().onUpdateNow().defaultNow(),
});

export const authorProfilesRelations = relations(authorProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [authorProfiles.userId],
    references: [users.id],
  }),
  blogs: many(blogs),
}));

export type AuthorProfile = typeof authorProfiles.$inferSelect;
export type Blog = typeof blogs.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type BlogCategory = typeof blogCategories.$inferSelect;
export type Driver = typeof drivers.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type RiderStat = typeof riderStats.$inferSelect;
export type Circuit = typeof circuits.$inferSelect;
export type CircuitFaq = typeof circuitFaqs.$inferSelect;
export type User = typeof users.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type SladaPage = typeof sladaPage.$inferSelect;
export type SladaCommittee = typeof sladaCommittee.$inferSelect;
export type CircuitCategory = typeof circuitCategories.$inferSelect;

// PAGE SEO TABLE
export const pageSeo = mysqlTable("page_seo", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  pageName: varchar("page_name", { length: 50 }).notNull().unique(), // e.g., 'home', 'drivers', 'riders', 'results', 'tracks', 'teams'
  title: text("title"),
  description: text("description"),
  keywords: text("keywords"),
  ogImage: text("og_image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().onUpdateNow().defaultNow(),
});

export type PageSeo = typeof pageSeo.$inferSelect;
