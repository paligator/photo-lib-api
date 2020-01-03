import fs from "fs";
import { mkdir } from "../helpers/fs";
import * as C from "../helpers/common";
import { emit, EVENT_SEND_EMAIL } from "../helpers/events";
import config from "config";
import path from "path";


export async function updateIpAddress() {

	C.logD("UpdateIpAddress started");

	const currentIp: string = await C.getCurrentIp();
	const tmpFolder: string = config.get("paths.tmpFolder");
	const ipFile = path.join(tmpFolder, "ip.txt");
	let lastSavedIp = null;

	mkdir(tmpFolder);

	if (fs.existsSync(ipFile) === true) {
		lastSavedIp = fs.readFileSync(ipFile, "utf8");
	}

	C.logI(`UpdateIpAddress -> last saved ip is: "${lastSavedIp}" currentIp is "${currentIp}"`);

	if (currentIp && lastSavedIp !== currentIp) {
		fs.writeFileSync(ipFile, currentIp, { "encoding": "utf8" });
		C.logI(`UpdateIpAddress -> Ip has been updated to ${currentIp}`);
		emit(EVENT_SEND_EMAIL, { to: config.get("email.updatedIpReceiver"), subject: "BERRY new IP", body: `Here it is: ${currentIp}` });
	}

}