import { scrapeGoogleJobs } from "./scripts/GoogleJobs/GoogleJobsScraper";

scrapeGoogleJobs().then((jobs) => {
  console.log("Scraped jobs:", jobs);
}); 
