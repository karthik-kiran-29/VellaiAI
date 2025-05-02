import puppeteer, { Browser } from 'puppeteer';
import { JobDetails } from '../../types/jobs';

async function scrapePage(browser: Browser, url: string, pageNumber: number): Promise<JobDetails[]> {
  const jobs: JobDetails[] = [];
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Accept cookies if dialog appears
    try {
      const acceptCookiesButton = await page.$('button[jsname="higCR"]');
      if (acceptCookiesButton) {
        await acceptCookiesButton.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
      }
    } catch (e) {
      console.log('No cookie dialog found or failed to accept');
    }

    // Wait for job listings to load
    await page.waitForSelector('a.Si6A0c, div.sFMGX', { timeout: 10000 });
    
    const jobTitles = await page.$$eval('h3.Ki3IFe', (elements) => 
      elements.map(element => element.textContent?.trim()).filter(Boolean) as string[]
    );
    
    console.log(`Found ${jobTitles.length} jobs on page ${pageNumber}`);

    // Process each job on the page
    for (let i = 0; i < jobTitles.length; i++) {
       const jobLink = jobTitles[i];

        // Find and click the specific job title link
        await page.evaluate((jobTitle) => {
            const elements = Array.from(document.querySelectorAll('h3.Ki3IFe'));
            const element = elements.find(el => el.textContent?.trim() === jobTitle);
            if (element) {
          (element as HTMLElement).click();
            }
        }, jobLink);

        // Wait for the job details to load
        await page.waitForNetworkIdle({ idleTime: 1000 });
        
        
        try {
          // Extract job details
          const jobDetails = await page.evaluate(() => {
            // Job title
            const titleElement = document.querySelector('h2.p1N2lc');
            const title = titleElement ? titleElement.textContent?.trim() : '';
            
            // Company
            const companyElement = document.querySelector('.RP7SMd span');
            const company = companyElement ? companyElement.textContent?.trim() : 'Google';
            
            // Location
            const locationElements = document.querySelectorAll('.pwO9Dc .r0wTof');
            let location = '';
            locationElements.forEach(el => {
              location += (el.textContent?.trim() + '; ');
            });
            location = location.replace(/;\s*$/, '');
            
            // Job ID (from URL)
            const url = window.location.href;
            const idMatch = url.match(/jobId=([^&]+)/);
            const id = idMatch ? idMatch[1] : Math.random().toString(36).substring(2, 15);
            
            // Description
            const descriptionElement = document.querySelector('.aG5W3 p');
            const description = descriptionElement ? descriptionElement.textContent?.trim() : '';
            
            // Minimum qualifications
            const minimumQualifications: string[] = [];
            const minQualHeading = Array.from(document.querySelectorAll('.KwJkGe h3')).find(el => el.textContent?.includes('Minimum qualifications'));
            if (minQualHeading) {
              const ulElement = minQualHeading.nextElementSibling;
              if (ulElement?.tagName === 'UL') {
                Array.from(ulElement.querySelectorAll('li')).forEach(el => {
                  const text = el.textContent?.trim();
                  if (text) minimumQualifications.push(text);
                });
              }
            }
            
            // Preferred qualifications
            const preferredQualifications: string[] = [];
            const prefQualHeading = Array.from(document.querySelectorAll('.KwJkGe h3')).find(el => el.textContent?.includes('Preferred qualifications'));
            if (prefQualHeading) {
              const ulElement = prefQualHeading.nextElementSibling;
              if (ulElement?.tagName === 'UL') {
                Array.from(ulElement.querySelectorAll('li')).forEach(el => {
                  const text = el.textContent?.trim();
                  if (text) preferredQualifications.push(text);
                });
              }
            }
            
            // Responsibilities
            const responsibilities: string[] = [];
            const respHeading = Array.from(document.querySelectorAll('.BDNOWe h3')).find(el => el.textContent?.includes('Responsibilities'));
            if (respHeading) {
              const ulElement = respHeading.nextElementSibling;
              if (ulElement?.tagName === 'UL') {
                Array.from(ulElement.querySelectorAll('li')).forEach(el => {
                  const text = el.textContent?.trim();
                  if (text) responsibilities.push(text);
                });
              }
            }
            
            return {
              id,
              title: title || '',
              company: company || 'Google',
              location: location || '',
              description: description || '',
              qualifications: {
                minimum: minimumQualifications,
                preferred: preferredQualifications
              },
              responsibilities: responsibilities
            };
          });
          
          
          jobs.push(jobDetails as JobDetails);
          console.log(`Scraped job: ${jobDetails.title}`);
          
        } catch (error) {
          console.error(`Error scraping job ${i+1}:`, error);
        } 
    }
    
  } catch (error) {
    console.error(`Error scraping page ${pageNumber}:`, error);
  } finally {
    await page.close();
  }
  
  return jobs;
}

export const scrapeGoogleJobs = async (): Promise<JobDetails[]> => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1366, height: 768 } 
  });
  
  try {
    // Get total number of pages first
    const page = await browser.newPage();
    await page.goto("https://www.google.com/about/careers/applications/jobs/results/116029409239933638-scaled-delivery-manager-gtech-ads-solutions?location=India&sortBy=newest&sort_by=date");
    
    const totalJobs = await page.evaluate(() => {
      const element = document.querySelector('div[jsname="GRPLBc"]');
      if (!element) return 0;
      const ariaLabel = element.getAttribute('aria-label');
      const match = ariaLabel && ariaLabel.match(/of (\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    
    await page.close();
    
    const totalPages = Math.ceil(totalJobs / 20);
    const allJobs: JobDetails[] = [];
    
    // Process pages in batches of 5
    for (let i = 0; i < totalPages; i += 5) {
      const currentBatch = [];
      for (let j = 0; j < 5 && i + j < totalPages; j++) {
        const pageNum = i + j + 1;
        const url = `https://www.google.com/about/careers/applications/jobs/results/116029409239933638-scaled-delivery-manager-gtech-ads-solutions?location=India&sortBy=newest&sort_by=date&page=${pageNum}`;
        currentBatch.push(scrapePage(browser, url, pageNum));
      }
      
      // Wait for all pages in the current batch to finish
      const batchResults = await Promise.all(currentBatch);
      allJobs.push(...batchResults.flat());
      
      // Small delay between batches to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return allJobs;
    
  } catch (error) {
    console.error('Error during scraping:', error);
    return [];
  } finally {
    await browser.close();
  }
};
