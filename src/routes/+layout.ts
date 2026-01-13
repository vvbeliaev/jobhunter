export const ssr = false;
export const prerender = false;

import { globalUserLoad } from '$lib/apps/user';

export async function load({ depends }) {
	depends('app:global');

	const globalPromise = globalUserLoad();
	return { globalPromise };
}
