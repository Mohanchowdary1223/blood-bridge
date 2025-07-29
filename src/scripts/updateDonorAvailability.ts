import { connectMongo } from '../lib/mongodb';
import DonorScheduleDonation from '../models/donorscheduledonation/DonorScheduleDonation';
import Donor from '../models/Donor';

/**
 * This script checks all scheduled donations and updates the donor's isAvailable status to true
 * if the scheduled date is today or in the past.
 *
 * To run: node src/scripts/updateDonorAvailability.js (or .ts if using ts-node)
 */

async function updateDonorAvailability() {
  await connectMongo();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find all scheduled donations where scheduledDate <= today
  const schedules = await DonorScheduleDonation.find({
    scheduledDate: { $lte: today }
  });

  for (const schedule of schedules) {
    // Update donor's isAvailable to true
    await Donor.findOneAndUpdate(
      { _id: schedule.userId },
      { isAvailable: true }
    );
    // Optionally, you can remove the schedule after updating
    // await DonorScheduleDonation.deleteOne({ _id: schedule._id });
  }

  console.log(`Updated ${schedules.length} donors to available.`);
}

updateDonorAvailability().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
