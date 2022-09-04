import { InboxIcon } from '@heroicons/react/24/outline';
import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { NavLink, useLoaderData } from '@remix-run/react';
import { getCompletedProjects } from '~/models/project.server';
import { getCompletedTasks } from '~/models/task.server';
import * as paths from '~/paths';
import { requireUserId } from '~/session.server';

export const meta: MetaFunction = () => ({
	title: 'Logbook',
});

export async function loader({ request }: LoaderArgs) {
	const userId = await requireUserId(request);
	const taskListItems = (await getCompletedTasks({ userId }))
		// Filter out tasks in completed projects. Was easier to do it here than in the query.
		.filter((task) => !task.Project?.done)
		.map((task) => ({ ...task, isProject: false }));
	const projects = (await getCompletedProjects({ userId })).map((project) => ({ ...project, isProject: true }));

	// For future
	// const items = [...taskListItems, ...projects].sort((a, b) => b.completed!.getTime() - a.completed!.getTime());

	const items = [...taskListItems, ...projects];

	return json({ items });
}

export default function InboxPage() {
	const data = useLoaderData<typeof loader>();

	return (
		<>
			{data.items.length === 0 ? (
				<InboxIcon className="p-4" />
			) : (
				<ol>
					{data.items.map((taskOrProject) => (
						<li key={taskOrProject.id}>
							<NavLink
								className={({ isActive }) => `block border-b p-4 text-xl ${isActive ? 'bg-white' : ''}`}
								to={
									taskOrProject.isProject
										? paths.project({ projectId: taskOrProject.id })
										: paths.task({ taskId: taskOrProject.id })
								}>
								📝 {taskOrProject.title}
							</NavLink>
						</li>
					))}
				</ol>
			)}
		</>
	);
}
