import PocketBase from 'pocketbase';

/**
 * Usage:
 * PB_URL=http://127.0.0.1:8090 PB_EMAIL=admin@example.com PB_PASSWORD=password123 TARGET_OWNER_ID=your_user_id node scripts/update-jobs-owner.js
 */

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const PB_EMAIL = process.env.PB_EMAIL;
const PB_PASSWORD = process.env.PB_PASSWORD;
const TARGET_OWNER_ID = process.env.TARGET_OWNER_ID;

if (!PB_EMAIL || !PB_PASSWORD || !TARGET_OWNER_ID) {
	console.error('Missing required environment variables: PB_EMAIL, PB_PASSWORD, TARGET_OWNER_ID');
	process.exit(1);
}

const pb = new PocketBase(PB_URL);

async function main() {
	try {
		// Auth as superuser (admin)
		// Note: In PocketBase 0.23+, admins are moved to the _superusers collection
		await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASSWORD);
		console.log('✅ Authenticated successfully');

		// Fetch all jobs that don't have this owner yet
		const jobs = await pb.collection('jobs').getFullList({
			filter: `owner != "${TARGET_OWNER_ID}"`
		});

		console.log(`found ${jobs.length} jobs to update...`);

		for (const job of jobs) {
			await pb.collection('jobs').update(job.id, {
				owner: TARGET_OWNER_ID
			});
			console.log(`  - Updated job: ${job.id} (${job.title})`);
		}

		console.log('✨ All jobs updated successfully!');
	} catch (error) {
		console.error('❌ Error:', error.message);
		if (error.data) {
			console.error('Data:', JSON.stringify(error.data, null, 2));
		}
		process.exit(1);
	}
}

main();

