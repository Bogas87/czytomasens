"use strict";

// W głównym pliku Express, po app.use(express.json()), dodaj:
//
// const followupRoutes = require("./routes/followup.routes");
// app.use("/api/followup", followupRoutes);
//
// Następnie uruchom migrację:
// psql "$DATABASE_URL" -f server/migrations/20260714_followup_profiles.sql
//
// Osobna usługa Railway dla przypomnień:
// node server/src/jobs/followup-reminder.worker.js
