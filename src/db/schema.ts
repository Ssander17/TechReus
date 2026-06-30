import { pgTable, text, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";

// Customers table
export const dbCustomers = pgTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  trackingNumber: text("tracking_number"),
  hasAccount: boolean("has_account").default(false),
  password: text("password"),
  ecoPoints: integer("eco_points").default(0),
  createdAt: text("created_at").notNull(),
});

// User submitted products table
export const dbUserSubmittedProducts = pgTable("user_submitted_products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  suggestedPrice: real("suggested_price").notNull(),
  co2Saved: integer("co2_saved").notNull(),
  batteryHealth: text("battery_health"),
  screenStatus: text("screen_status"),
  storageStatus: text("storage_status"),
  cpuStatus: text("cpu_status"),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name"),
  status: text("status").notNull().default("pending_review"),
  daysRemaining: integer("days_remaining").notNull(),
  createdAt: text("created_at").notNull(),
});
