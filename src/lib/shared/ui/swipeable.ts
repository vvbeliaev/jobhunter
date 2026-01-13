import type { Action } from 'svelte/action';

export interface SwipeableOptions {
	/** Threshold in pixels to trigger swipe */
	threshold?: number;
	/** Edge width to start swipe from (for opening) */
	edgeWidth?: number;
	/** Direction of the swipe to open */
	direction?: 'left' | 'right';
	/** Whether the sidebar is currently open */
	isOpen: boolean;
	/** Callback when swipe to open is detected */
	onOpen?: () => void;
	/** Callback when swipe to close is detected */
	onClose?: () => void;
}

export interface SwipeableAttributes {
	onswipeopen?: (e: CustomEvent) => void;
	onswipeclose?: (e: CustomEvent) => void;
}

/**
 * Svelte action for swipeable sidebar behavior
 * Detects edge swipes to open and swipes in opposite direction to close
 */
export const swipeable: Action<HTMLElement, SwipeableOptions, SwipeableAttributes> = (
	node,
	options
) => {
	let touchStartX = 0;
	let touchCurrentX = 0;
	let isSwiping = false;
	let currentOptions = options;

	const threshold = currentOptions.threshold ?? 50;
	const edgeWidth = currentOptions.edgeWidth ?? 30;
	const direction = currentOptions.direction ?? 'right';

	function handleTouchStart(e: TouchEvent) {
		const touch = e.touches[0];
		touchStartX = touch.clientX;
		touchCurrentX = touch.clientX;

		// For opening: only allow swipe from edge
		if (!currentOptions.isOpen) {
			if (direction === 'right' && touchStartX > edgeWidth) return;
			if (direction === 'left' && touchStartX < window.innerWidth - edgeWidth) return;
		}

		isSwiping = true;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isSwiping) return;
		const touch = e.touches[0];
		touchCurrentX = touch.clientX;
	}

	function handleTouchEnd() {
		if (!isSwiping) return;

		const deltaX = touchCurrentX - touchStartX;

		if (direction === 'right') {
			if (!currentOptions.isOpen && deltaX > threshold) {
				node.dispatchEvent(new CustomEvent('swipeopen'));
				currentOptions.onOpen?.();
			} else if (currentOptions.isOpen && deltaX < -threshold) {
				node.dispatchEvent(new CustomEvent('swipeclose'));
				currentOptions.onClose?.();
			}
		} else {
			// direction === 'left'
			if (!currentOptions.isOpen && deltaX < -threshold) {
				node.dispatchEvent(new CustomEvent('swipeopen'));
				currentOptions.onOpen?.();
			} else if (currentOptions.isOpen && deltaX > threshold) {
				node.dispatchEvent(new CustomEvent('swipeclose'));
				currentOptions.onClose?.();
			}
		}

		isSwiping = false;
		touchStartX = 0;
		touchCurrentX = 0;
	}

	node.addEventListener('touchstart', handleTouchStart);
	node.addEventListener('touchmove', handleTouchMove);
	node.addEventListener('touchend', handleTouchEnd);

	return {
		update(newOptions) {
			currentOptions = newOptions;
		},
		destroy() {
			node.removeEventListener('touchstart', handleTouchStart);
			node.removeEventListener('touchmove', handleTouchMove);
			node.removeEventListener('touchend', handleTouchEnd);
		}
	};
};
