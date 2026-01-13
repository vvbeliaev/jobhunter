<script lang="ts">
	import { userStore, userApi } from '$lib/apps/user';
	import { ThemeController, Button, Input } from '$lib';
	import { Camera, Edit2, Check, X } from 'lucide-svelte';

	const user = $derived(userStore.user);
	const avatarUrl = $derived(userStore.avatarUrl);

	let isEditingName = $state(false);
	let editedName = $state('');
	let isUploadingAvatar = $state(false);
	let fileInput: HTMLInputElement | null = $state(null);

	function startEditingName() {
		editedName = user?.name || '';
		isEditingName = true;
	}

	async function saveName() {
		try {
			await userApi.updateProfile({ name: editedName });
			isEditingName = false;
		} catch (err) {
			console.error('Failed to update name:', err);
		}
	}

	async function handleAvatarChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (!target.files?.[0]) return;

		const file = target.files[0];
		const formData = new FormData();
		formData.append('avatar', file);

		isUploadingAvatar = true;
		try {
			await userApi.updateProfile(formData);
		} catch (err) {
			console.error('Failed to update avatar:', err);
		} finally {
			isUploadingAvatar = false;
		}
	}
</script>

<div class="absolute top-2 right-2 z-50 sm:hidden">
	<ThemeController />
</div>

<div class="card bg-base-100 shadow-sm">
	<div class="card-body">
		<div class="flex items-center gap-6">
			<!-- Avatar Section -->
			<div class="group relative">
				<div
					class="size-20 overflow-hidden rounded-full ring-2 ring-primary/20 transition-all group-hover:ring-primary"
				>
					{#if avatarUrl}
						<img src={avatarUrl} alt={user?.name || 'User'} class="h-full w-full object-cover" />
					{:else}
						<div
							class="flex h-full w-full items-center justify-center bg-primary/10 text-2xl font-bold text-primary"
						>
							{(user?.name || user?.email || 'U')[0].toUpperCase()}
						</div>
					{/if}
				</div>

				<button
					class="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
					onclick={() => fileInput?.click()}
					disabled={isUploadingAvatar}
				>
					{#if isUploadingAvatar}
						<span class="loading loading-sm loading-spinner text-white"></span>
					{:else}
						<Camera class="text-white" size={20} />
					{/if}
				</button>
				<input
					type="file"
					accept="image/*"
					class="hidden"
					bind:this={fileInput}
					onchange={handleAvatarChange}
				/>
			</div>

			<!-- User Info Section -->
			<div class="min-w-0 flex-1 space-y-1">
				{#if isEditingName}
					<div class="flex items-end gap-2">
						<Input
							label="Name"
							bind:value={editedName}
							placeholder="Enter your name"
							size="sm"
							containerClass="mb-0"
						/>
						<div class="flex gap-1 pb-1">
							<Button size="sm" square color="success" onclick={saveName}>
								<Check size={16} />
							</Button>
							<Button
								size="sm"
								square
								color="neutral"
								variant="ghost"
								onclick={() => (isEditingName = false)}
							>
								<X size={16} />
							</Button>
						</div>
					</div>
				{:else}
					<div class="flex items-center gap-2">
						<h2 class="truncate text-xl font-bold">{user?.name || '<No Name>'}</h2>
						<button class="btn btn-circle btn-ghost btn-xs" onclick={startEditingName}>
							<Edit2 size={14} />
						</button>
					</div>
				{/if}

				<p class="truncate text-sm text-base-content/70">{user?.email}</p>

				<div class="flex flex-wrap gap-2 pt-1">
					{#if user?.verified === false}
						<div class="badge badge-sm badge-warning">Email not verified</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
