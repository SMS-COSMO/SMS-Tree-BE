import { integer, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core'
import { users } from './user';
import { groups } from './group';

export const usersToGroups = sqliteTable('users_to_groups', {
    userId: integer('user_id').notNull().references(() => users.id),
    groupId: integer('group_id').notNull().references(() => groups.id),
}, (t) => ({
    pk: primaryKey(t.userId, t.groupId),
}),
);
