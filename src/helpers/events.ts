import events from "events";
import * as C from "../helpers/common";
import { sendEmailSubscription } from "./email";

const eventEmitter = new events.EventEmitter();

// names of events
export const EVENT_SEND_EMAIL = "SEND_EMAIL";


export function emit(eventName: string, eventArgs: any) {
	try {
		C.logI(`Events -> emit '${eventName}' started`);
		//TODO: Think about async function and log finish
		eventEmitter.emit(eventName, eventArgs);
	} catch (e) {
		C.logE(`Events -> emit '${eventName}' error`, e);
	}
}

function subscribe(eventKey: string, handler: (...args: any[]) => void) {
	C.logI(`Events -> subscribe '${eventKey}' handler '${handler.name}'`);
	eventEmitter.on(eventKey, handler);
}

export function initSubscribers() {
	C.logI("Events -> start init subscribers");
	subscribe(EVENT_SEND_EMAIL, sendEmailSubscription);
	C.logI("Events -> end init subscribers");
}

