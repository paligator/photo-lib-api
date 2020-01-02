import schedule from "node-schedule";
import { updateIpAddress } from "../service/ipService";
import * as C from "./common";
import config from "config";

export function initSchedulers() {

	C.logI("Schedulers -> start init");

	const schedulers: any = config.get("schedulers");
	const schedulerUpdateIp = schedulers.updateIp;

	if (schedulerUpdateIp.enabled === true) {
		C.logI(`Schedulers -> UpdateIp started ${schedulerUpdateIp.cron}`);
		schedule.scheduleJob(schedulerUpdateIp.cron, updateIpAddress);
	} else {
		C.logI("Schedulers -> UpdateIp disabled");
	}

	C.logI("Schedulers -> start init");

}