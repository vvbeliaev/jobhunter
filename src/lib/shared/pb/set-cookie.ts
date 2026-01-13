import { pb } from './pb';

const DOMAIN = 'cogisoft.dev';

export function setPBCookie() {
	const host = typeof window !== 'undefined' ? window.location.hostname : '';
	const isDomain = host.endsWith(DOMAIN);
	const domainAttr = isDomain ? `Domain=.${DOMAIN}` : undefined;
	const maxAge = 100 * 24 * 60 * 60;

	document.cookie = [
		`pb_token=${pb.authStore.token}`,
		domainAttr,
		'Secure',
		'Path=/',
		`Max-Age=${maxAge}`,
		'SameSite=None'
	]
		.filter(Boolean)
		.join('; ');

	document.cookie = pb.authStore.exportToCookie({
		httpOnly: false,
		secure: true,
		sameSite: 'Lax',
		domain: isDomain ? `.${DOMAIN}` : undefined,
		path: '/'
	});
}
