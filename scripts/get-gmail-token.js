/**
 * Run once to get a Gmail refresh token.
 * Usage: node scripts/get-gmail-token.js
 */

const { google } = require("googleapis");
const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");

// Load .env.local
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8").split("\n").forEach(line => {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  });
}

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env.local");
  process.exit(1);
}

const PORT = 3001;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/spreadsheets",
  ],
  prompt: "consent",
});

console.log("\nStarting local server on port", PORT, "...");
console.log("\nOpen this URL in your browser:\n");
console.log(authUrl);
console.log("\nWaiting for Google to redirect back...\n");

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  if (parsed.pathname !== "/callback") return;

  const code = parsed.query.code;
  if (!code) {
    res.end("No code received. Try again.");
    server.close();
    return;
  }

  res.end("<h2>Success! You can close this tab and check your terminal.</h2>");
  server.close();

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("Success! Copy this line into your .env.local:\n");
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log();
  } catch (err) {
    console.error("Error exchanging code:", err.message);
  }
});

server.listen(PORT);
