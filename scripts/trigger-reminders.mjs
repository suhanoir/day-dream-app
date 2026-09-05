// Quick CLI script to manually trigger and test the reminder processor locally
import http from "http";

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/cron/reminders",
  method: "GET",
};

console.log("Triggering local reminder processor (http://localhost:3000/api/cron/reminders)...");

const req = http.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });
  res.on("end", () => {
    try {
      const json = JSON.parse(data);
      console.log("Reminder Processor Result:");
      console.dir(json, { depth: null });
    } catch {
      console.log("Response:", data);
    }
  });
});

req.on("error", (e) => {
  console.error("Failed to connect to local server. Make sure 'npm run dev' is running on port 3000!");
  console.error(e.message);
});

req.end();

