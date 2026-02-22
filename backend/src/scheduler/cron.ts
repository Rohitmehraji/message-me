import cron from "node-cron";
import { pickRunnableCampaigns, processCampaign } from "../services/campaign-service.js";

export const startScheduler = () => {
  cron.schedule("*/1 * * * *", async () => {
    const campaigns = await pickRunnableCampaigns();
    for (const campaign of campaigns) {
      await processCampaign(campaign.id);
    }
  });
};
