import { Client } from 'pg';

export async function handler(event) {
  const id = event.queryStringParameters.id;

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: true }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT id, username, email FROM users WHERE id = $1', [id]);
    return {
      statusCode: 200,
      body: JSON.stringify(res.rows[0]),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    await client.end();
  }
}
