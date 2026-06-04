import { mysqlTable, varchar, text, boolean, timestamp, longtext, int, primaryKey } from "drizzle-orm/mysql-core";
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
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().onUpdateNow().defaultNow(),
});

// CATEGORIES TABLE
export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 191 }).notNull().unique(),
  parentId: varchar("parent_id", { length: 191 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().onUpdateNow().defaultNow(),
});

// BLOG CATEGORIES JUNCTION TABLE
export const blogCategories = mysqlTable("blog_categories", {
  blogId: varchar("blog_id", { length: 191 }).notNull(),
  categoryId: varchar("category_id", { length: 191 }).notNull(),
}, (table) => [
  primaryKey({ columns: [table.blogId, table.categoryId] })
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
  userId: varchar("user_id", { length: 191 }),
  pendingChanges: longtext("pending_changes"),

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
export const blogsRelations = relations(blogs, ({ many }) => ({
  blogCategories: many(blogCategories),
  comments: many(comments),
}));

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  blogCategories: many(blogCategories),
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
}));

export const circuitFaqsRelations = relations(circuitFaqs, ({ one }) => ({
  circuit: one(circuits, {
    fields: [circuitFaqs.circuitId],
    references: [circuits.id],
  }),
}));

// USERS TABLE
export const users = mysqlTable("users", {
  id: varchar("id", { length: 191 }).primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
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
}));

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
