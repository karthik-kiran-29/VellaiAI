// jobDetails.ts
import { pool } from './db'
import { JobDetails } from '../types/jobs'

/**
 * Inserts multiple JobDetails records in one query.
 * @param jobs - Array of job objects (without `id` or `postedAt`).
 * @returns Array of inserted JobDetails with generated `id` and `postedAt`.
 */
export async function insertJobDetailsBulk(
  jobs: Array<Omit<JobDetails, 'id' | 'postedAt'>>
): Promise<JobDetails[]> {
  if (jobs.length === 0) return []

  // Build the list of columns we want to insert.
  const columns = [
    'title',
    'company',
    'location',
    'description',
    'posted_at',
    'qualifications',
    'responsibilities',
    'job_link'
  ]

  // Start building the SQL:
  // INSERT INTO job_details (col1, col2, ...) VALUES
  let query = `
    INSERT INTO job_details (${columns.join(', ')})
    VALUES
  `

  // We’ll accumulate parameter placeholders and values here
  const values: any[] = []
  const valueRows: string[] = []

  jobs.forEach((job, rowIdx) => {
    const baseIdx = rowIdx * columns.length
    // Create placeholder group: ($1, $2, …, $7)
    const placeholders = columns
      .map((_, colIdx) => `$${baseIdx + colIdx + 1}`)
      .join(', ')
    valueRows.push(`(${placeholders})`)

    // Push the actual values in the same order as columns
    values.push(
      job.title,
      job.company,
      job.location,
      job.description,
      new Date(),                              // posted_at = NOW() equivalent
      job.qualifications ? JSON.stringify(job.qualifications) : null,
      job.responsibilities || null,
      job.job_link || null
    )
  })

  // Combine the VALUES tuples and add RETURNING
  query += valueRows.join(',\n') + `
    RETURNING
      id,
      title,
      company,
      location,
      description,
      posted_at AS "postedAt",
      qualifications,
      responsibilities
  `

  // Execute the bulk insert
  const { rows } = await pool.query<JobDetails>(query, values)
  return rows
}
