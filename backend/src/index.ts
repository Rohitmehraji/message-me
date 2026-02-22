import { app } from "./app.js";
import { env } from "./config/env.js";
import { startScheduler } from "./scheduler/cron.js";

app.listen(env.PORT, () => {
  startScheduler();
  console.log(`API listening on ${env.PORT}`);
});
