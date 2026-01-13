import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import PocketBase, { AsyncAuthStore } from 'pocketbase';

import type { TypedPocketBase } from './pocketbase-types';
import { uiStore } from '../ui';

const store = new AsyncAuthStore({
	initial: browser ? (localStorage.getItem('pb_auth') ?? undefined) : undefined,
	save: async (s) => (browser ? localStorage.setItem('pb_auth', s) : Promise.resolve()),
	clear: async () => {
		if (!browser) return;
		localStorage.removeItem('pb_auth');
		uiStore.clear();
	}
});

export const pb = new PocketBase(env.PUBLIC_PB_URL, store) as TypedPocketBase;

pb.autoCancellation(true);
if (!browser) {
	pb.autoCancellation(false);
}
