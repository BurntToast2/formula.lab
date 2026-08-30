import { sql, relations } from "drizzle-orm";
import {
    pgEnum,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uuid,
    uniqueIndex,
    boolean,
    index,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", [
    "team_leader",
    "member",
    "admin"
]);

export const taskStatus = pgEnum("task_status", [
    "todo",
    "in_progress",
    "completed",
    "cancelled",
]);

export const taskPriority = pgEnum("task_priority", [
    "low",
    "medium",
    "high",
]);

export const invitations = pgTable("invitations", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const teams = pgTable("teams", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
});

export const users = pgTable(
    "users",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: text("name").notNull(),
        firstName: text("first_name").notNull(),
        surname: text("surname").notNull(),
        email: text("email").notNull().unique(),
        emailVerified: boolean("email_verified").default(false).notNull(),
        teamId: uuid("team_id")
            .notNull()
            .references(() => teams.id),
        role: userRole("role").notNull(),
        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        uniqueIndex("one_team_leader_per_team")
            .on(table.teamId)
            .where(sql`${table.role} = 'team_leader'`),
    ],
);

export const tasks = pgTable("tasks", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    teamId: uuid("team_id")
        .notNull()
        .references(() => teams.id),
    createdById: uuid("created_by_id")
        .notNull()
        .references(() => users.id),
    status: taskStatus("status")
        .notNull()
        .default("todo"),
    priority: taskPriority("priority")
        .notNull()
        .default("medium"),
    dueDate: timestamp("due_date"),
    createdAt: timestamp("created_at")
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow(),
});

export const taskResponsibilities = pgTable(
    "task_responsibilities",
    {
        taskId: uuid("task_id")
            .notNull()
            .references(() => tasks.id),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id),
    },
    (table) => [
        primaryKey({
            columns: [table.taskId, table.userId],
        }),
    ],
);

// Better Auth
export const session = pgTable(
    "session",
    {
        id: text("id").primaryKey(),
        expiresAt: timestamp("expires_at").notNull(),
        token: text("token")
            .notNull()
            .unique(),
        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => new Date())
            .notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),
    },
    (table) => [
        index("session_userId_idx")
            .on(table.userId),
    ],
);

export const account = pgTable(
    "account",
    {
        id: text("id").primaryKey(),
        issuer: text("issuer").notNull(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp(
            "access_token_expires_at",
        ),
        refreshTokenExpiresAt: timestamp(
            "refresh_token_expires_at",
        ),
        scope: text("scope"),
        password: text("password"),
        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        uniqueIndex("account_issuer_accountId_uidx").on(
            table.issuer,
            table.accountId,
        ),
        index("account_userId_idx")
            .on(table.userId),
    ],
);

export const verification = pgTable(
    "verification",
    {
        id: text("id").primaryKey(),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("verification_identifier_idx")
            .on(table.identifier),
    ],
);

export const userRelations = relations(
    users,
    ({ many }) => ({
        sessions: many(session),
        accounts: many(account),
    }),
);

export const sessionRelations = relations(
    session,
    ({ one }) => ({
        user: one(users, {
            fields: [session.userId],
            references: [users.id],
        }),
    }),
);

export const accountRelations = relations(
    account,
    ({ one }) => ({
        user: one(users, {
            fields: [account.userId],
            references: [users.id],
        }),
    }),
);
