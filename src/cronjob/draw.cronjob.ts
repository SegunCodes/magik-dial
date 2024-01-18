import { 
  checkForScheduledDraws,
  updateScheduledDraws,
} from '../services/draw.service';
import { executeDrawLogic } from '../controllers/draw/draw.controller';
import cron from 'node-cron';

const cronSchedule = '0 * * * *'; // every hour
// Function to perform the scheduled draws check
export const performScheduledDrawsCheck = async () => {
  try {
    // Fetch scheduled draws
    const scheduledDraws = await checkForScheduledDraws();

    // Iterate through scheduled draws
    for (const scheduledDraw of scheduledDraws) {
      // Execute the draw logic
      const drawResult = await executeDrawLogic(scheduledDraw.productId, scheduledDraw.numberOfWinners);

      if (drawResult.status === 'success') {
        // If the draw was successful, mark it as performed
        await updateScheduledDraws(scheduledDraw.id);
      }
    }

    console.log('Scheduled draws checked and performed successfully');
  } catch (error) {
    // Handle errors and log a message
    console.error('Error during scheduled draws check:', error);
  }
};

// Schedule the task using node-cron
cron.schedule(cronSchedule, performScheduledDrawsCheck);

console.log(`Scheduled draws check will be performed based on the cron schedule: ${cronSchedule}`);
