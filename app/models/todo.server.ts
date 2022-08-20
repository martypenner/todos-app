import type { Todo, User } from '@prisma/client';

import { prisma } from '~/db.server';

export type { Todo } from '@prisma/client';

export function getTodo({
	id,
	userId,
}: Pick<Todo, 'id'> & {
	userId: User['id'];
}) {
	return prisma.todo.findFirst({
		select: { id: true, notes: true, title: true },
		where: { id, userId },
	});
}

export function getTodoListItems({ userId }: { userId: User['id'] }) {
	return prisma.todo.findMany({
		where: { userId },
		select: { id: true, title: true },
		orderBy: { updatedAt: 'desc' },
	});
}

export function createTodo({
	notes,
	title,
	userId,
}: Pick<Todo, 'notes' | 'title'> & {
	userId: User['id'];
}) {
	return prisma.todo.create({
		data: {
			title,
			notes,
			user: {
				connect: {
					id: userId,
				},
			},
		},
	});
}

export function deleteTodo({ id, userId }: Pick<Todo, 'id'> & { userId: User['id'] }) {
	return prisma.todo.deleteMany({
		where: { id, userId },
	});
}
