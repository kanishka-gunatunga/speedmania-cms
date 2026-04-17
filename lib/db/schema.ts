import { mysqlTable, varchar, text, boolean, timestamp, longtext, int } from "drizzle-orm/mysql-core";
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

// DRIVERS TABLE
export const drivers = mysqlTable("drivers", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  fullName: text("full_name").notNull(),
  dob: varchar("dob", { length: 100 }), // Using string for simple date handling
  otherName: text("other_name"),
  slug: varchar("slug", { length: 191 }).notNull().unique(),
  
  // Motorsport Background
  racingCategory: varchar("racing_category", { length: 100 }), // Karting, Circuit, etc.
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
  
  // Vehicle Information
  vehicleModel: text("vehicle_model"),
  engineCapacity: varchar("engine_capacity", { length: 50 }),
  vehicleClass: varchar("vehicle_class", { length: 100 }),
  chassisNumber: varchar("chassis_number", { length: 100 }),
  liveryScheme: text("livery_scheme"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().onUpdateNow().defaultNow(),
});

// ACHIEVEMENTS TABLE
export const achievements = mysqlTable("achievements", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  driverId: varchar("driver_id", { length: 191 }).notNull(),
  raceName: text("race_name").notNull(),
  year: int("year"),
  position: varchar("position", { length: 50 }),
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
});

// RELATIONS
export const driversRelations = relations(drivers, ({ many }) => ({
  achievements: many(achievements),
  riderStats: many(riderStats),
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

export type Blog = typeof blogs.$inferSelect;
export type Driver = typeof drivers.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type RiderStat = typeof riderStats.$inferSelect;
