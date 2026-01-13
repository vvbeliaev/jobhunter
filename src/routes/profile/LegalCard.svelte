<script lang="ts">
	import { Shield, FileText, Scale } from 'lucide-svelte';
</script>

<div class="card bg-base-100 shadow-sm">
	<div class="card-body p-4 sm:p-6">
		<h3 class="mb-2 text-sm font-semibold">Legal</h3>
		<div class="flex flex-col gap-1">
			<a
				href="/legal/terms-and-conditions"
				class="btn justify-start px-2 font-normal btn-ghost btn-sm"
			>
				<FileText class="mr-2 h-4 w-4 opacity-70" />
				Terms of Service
			</a>
			<a href="/legal/privacy-policy" class="btn justify-start px-2 font-normal btn-ghost btn-sm">
				<Shield class="mr-2 h-4 w-4 opacity-70" />
				Privacy Policy
			</a>
			<!-- Optional: Licenses or other legal docs -->
		</div>
	</div>
</div>
