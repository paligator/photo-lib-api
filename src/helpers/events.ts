import events from "events";
import * as C from "../helpers/common";
import { sendEmailSubscription } from "../service/emailService";

const eventEmitter = new events.EventEmitter();

// names of events
export const EVENT_SEND_EMAIL = "SEND_EMAIL";


export function emit(eventName: string, eventArgs: any) {
	try {
		C.logI(`Events -> emit '${eventName}' started`);
		//TODO: Think about async function and log finish
		eventEmitter.emit(eventName, eventArgs);
		//C.logI(`Events -> emit '${eventName}' finished `);
	} catch (e) {
		C.logE(`Events -> emit '${eventName}' error`, e);
	}
}

function subscribe(eventKey: string, handler: (...args: any[]) => void) {
	C.logI(`Events -> subscribe '${eventKey}' handler '${handler.name}'`);
	eventEmitter.on(eventKey, handler);
}

export function initSubscribers() {
	subscribe(EVENT_SEND_EMAIL, sendEmailSubscription);
}

