const schedule = require("node-schedule");
const updateMovieSuggestions = require("./jobs/updateMovieSuggestions");

// Run the job every day at midnight
const job = schedule.scheduleJob("0 0 * * *", function () {
  console.log("Running updateMovieSuggestions job");
  updateMovieSuggestions();
});

console.log("Job scheduler started");
