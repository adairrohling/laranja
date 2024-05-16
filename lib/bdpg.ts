import { Pool, Client } from "pg";
//

// "postgresql://school_owner:tauU52xEWpHC@ep-royal-hill-a576l84m.us-east-2.aws.neon.tech/school?sslmode=require";

const connectionString =
    "postgres://default:EQ56KwbDjNVl@ep-throbbing-pine-12654090.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require"
export const pool = new Pool({
  connectionString,
});

export const client = new Client({
  connectionString,
});
