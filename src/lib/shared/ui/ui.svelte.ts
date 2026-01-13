import { z } from 'zod';
import { browser } from '$app/environment';

const UIStateSchema = z.object({
	paywallOpen: z.boolean().default(false),
	authWallOpen: z.boolean().default(false),
	sidebarOpen: z.boolean().default(false),
	sidebarExpanded: z.boolean().default(true),
	rightSidebarOpen: z.boolean().default(false),
	feedbackModalOpen: z.boolean().default(false),
	emailVerifyWallOpen: z.boolean().default(false)
});

type UIState = z.infer<typeof UIStateSchema>;

class UIStore {
	private _state: UIState | null = $state(
		UIStateSchema.parse(JSON.parse(browser ? (localStorage.getItem('uiState') ?? '{}') : '{}'))
	);

	emailVerifyWallOpen = $derived(this._state?.emailVerifyWallOpen);
	paywallOpen = $derived(this._state?.paywallOpen);
	authWallOpen = $derived(this._state?.authWallOpen);
	feedbackModalOpen = $derived(this._state?.feedbackModalOpen);

	// Main sidebar (mobile drawer + desktop sidebar)
	sidebarOpen = $derived(this._state?.sidebarOpen);
	// Desktop sidebar expanded/collapsed state
	sidebarExpanded = $derived(this._state?.sidebarExpanded);
	// Right sidebar (for control panels etc.)
	rightSidebarOpen = $derived(this._state?.rightSidebarOpen);

	// Legacy aliases for backwards compatibility
	get globalSidebarOpen() {
		return this.sidebarExpanded;
	}
	get mobileSidebarOpen() {
		return this.sidebarOpen;
	}

	toggleEmailVerifyWallOpen() {
		if (!this._state) return;
		this._state.emailVerifyWallOpen = !this._state.emailVerifyWallOpen;
		this.saveState();
	}
	setEmailVerifyWallOpen(open: boolean) {
		if (!this._state) return;
		this._state.emailVerifyWallOpen = open;
		this.saveState();
	}

	// paywallOpen
	togglePaywallOpen() {
		if (!this._state) return;
		this._state.paywallOpen = !this._state.paywallOpen;
		this.saveState();
	}
	setPaywallOpen(open: boolean) {
		if (!this._state) return;
		this._state.paywallOpen = open;
		this.saveState();
	}

	// authWallOpen
	toggleAuthWallOpen() {
		if (!this._state) return;
		this._state.authWallOpen = !this._state.authWallOpen;
		this.saveState();
	}
	setAuthWallOpen(open: boolean) {
		if (!this._state) return;
		this._state.authWallOpen = open;
		this.saveState();
	}

	// sidebarOpen (mobile drawer state)
	toggleSidebar() {
		if (!this._state) return;
		this._state.sidebarOpen = !this._state.sidebarOpen;
	}
	setSidebarOpen(open: boolean) {
		if (!this._state) return;
		this._state.sidebarOpen = open;
	}

	// sidebarExpanded (desktop expanded/collapsed state)
	toggleSidebarExpanded() {
		if (!this._state) return;
		this._state.sidebarExpanded = !this._state.sidebarExpanded;
		this.saveState();
	}
	setSidebarExpanded(expanded: boolean) {
		if (!this._state) return;
		this._state.sidebarExpanded = expanded;
		this.saveState();
	}

	// rightSidebarOpen
	toggleRightSidebar() {
		if (!this._state) return;
		this._state.rightSidebarOpen = !this._state.rightSidebarOpen;
	}
	setRightSidebarOpen(open: boolean) {
		if (!this._state) return;
		this._state.rightSidebarOpen = open;
	}

	// Legacy methods for backwards compatibility
	toggleGlobalSidebar() {
		this.toggleSidebarExpanded();
	}
	setGlobalSidebarOpen(open: boolean) {
		this.setSidebarExpanded(open);
	}
	toggleMobileSidebar() {
		this.toggleSidebar();
	}
	setMobileSidebarOpen(open: boolean) {
		this.setSidebarOpen(open);
	}

	// feedbackModalOpen
	toggleFeedbackModal() {
		if (!this._state) return;
		this._state.feedbackModalOpen = !this._state.feedbackModalOpen;
		this.saveState();
	}
	setFeedbackModalOpen(open: boolean) {
		if (!this._state) return;
		this._state.feedbackModalOpen = open;
		this.saveState();
	}

	loadState() {
		const raw = localStorage.getItem('uiState');
		if (raw) {
			try {
				this._state = UIStateSchema.parse(JSON.parse(raw));
				return;
			} catch {
				console.error('Failed to parse UI state');
			}
		}

		this._state = UIStateSchema.parse({});
		this.saveState();
	}

	private saveState() {
		localStorage.setItem('uiState', JSON.stringify(this._state));
	}

	clear() {
		this._state = UIStateSchema.parse({});
		this.saveState();
	}
}

export const uiStore = new UIStore();
