import { insertJobDetailsBulk } from "./db/jobDao";
import { scrapeGoogleJobs } from "./scripts/GoogleJobs/GoogleJobsScraper";

scrapeGoogleJobs().then(async (jobs) => {
  const inserted = await insertJobDetailsBulk(jobs);
  console.log('Inserted jobs:', inserted);
}); 
