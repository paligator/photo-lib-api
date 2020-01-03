import schedule from "node-schedule";
import { updateIpAddress } from "../service/ipService";
import * as C from "./common";
import config from "config";

export function initSchedulers() {

	const intanceId = process.env.NODE_APP_INSTANCE;
	const schedulers: any = config.get("schedulers");
	const startSchedulers = schedulers.enabled;

	if (startSchedulers !== true) {
		C.logI(`Schedulers -> disabled for pm2 instance "${intanceId}"`);
		return;
	}

	C.logI(`Schedulers -> start init, for pm2 intance: "${intanceId || "no pm2"}"`);

	// Update IP scheduler
	const schedulerUpdateIp = schedulers.updateIp;
	if (schedulerUpdateIp.enabled === true) {
		C.logI(`Schedulers -> UpdateIp started ${schedulerUpdateIp.cron}`);
		schedule.scheduleJob(schedulerUpdateIp.cron, updateIpAddress);
	} else {
		C.logI("Schedulers -> UpdateIp disabled");
	}

	C.logI("Schedulers -> end init");

}