import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

//Import secrets from .env file
dotenv.config();

// Initialize Notion client with API key
const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

let response = await notion.databases.query({ database_id: databaseId });

// Keep fetching more pages until no more results are returned
let results = response.results;
while (response.has_more) {
  response = await notion.databases.query({
    database_id: databaseId,
    start_cursor: response.next_cursor,
  });
  results = results.concat(response.results);
}

// Update the Range (feet) property of each entry with the converted value
const pagesToUpdate = results.map(result => ({
  id: result.id,
  properties: {
    'Range (feet)': {
      number: result.properties['Range (feet)'].number / 10 * 3,
    },
  },
}));

await pagesToUpdate.forEach(page => {
  notion.pages.update(pagesToUpdate);
  console.log(page.id + ' updated');
});
