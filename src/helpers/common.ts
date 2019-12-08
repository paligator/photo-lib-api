import { Errors } from "typescript-rest";
import fs from "fs";
import path from "path";
import moment from "moment";

import { getLogger } from "./logger";
import config from "config";
import appRootPath from "app-root-path";

//Why like this, there was wrong behaviour with instnceOf https://github.com/Microsoft/TypeScript/issues/13896 when process error in application level
class PhotoError extends Errors.HttpError {

	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore TS6133
	private __proto__: Errors.HttpError; 	private details: Error;

	public constructor(message?: string, statusCodeOrDetails1: number | any = 500, statusCodeOrDetails2: any | number = undefined) {
		const trueProto = new.target.prototype;
		super("PhotoError", message);

		if (Number.isInteger(statusCodeOrDetails1)) {
			this.statusCode = parseInt(statusCodeOrDetails1);
			this.details = statusCodeOrDetails2;
		} else if (Number.isInteger(statusCodeOrDetails2)) {
			this.statusCode = parseInt(statusCodeOrDetails2);
			this.details = statusCodeOrDetails1;
		} else {
			this.statusCode = 500;
			this.details = statusCodeOrDetails1 || statusCodeOrDetails2;
		}

		// TODO: Alternatively use Object.setPrototypeOf if you have an ES6 environment.
		this.__proto__ = trueProto;
	}
}

class PhotoAuthenticationError extends PhotoError {
	public constructor(message?: string, details: any = undefined) {
		super(message, 401, details);
	}
}

function sendData(data: any = undefined): any {
	const res =
	{
		status: "success",
		data: data
	};

	return res;
}

function meOrNull<T>(me: T): T | null {
	return me ? me : null;
}

function meOrVal<T>(me: T, val: any): T | any {
	return me ? me : val;
}

function toBoolean(val: any): boolean {
	if (typeof val === "string") {
		return val === "true";
	} else {
		return false;
	}
}

function deleteFromArray(array: any[], item: any): void {
	const index = array.indexOf(item);
	array.splice(index, 1);
}

function strIsEmtpy(value: any): boolean {
	return !value || value.trim === "";
}

function strNotEmp(value: any): boolean {
	return !strIsEmtpy(value);
}

async function waitFor(time: any): Promise<any> {
	return new Promise((resolve): void => {
		setTimeout(function (): any { resolve(); }, time);
	});
}

function logS(arg1: any, ...args: any): void {
	getLogger().silly(arg1, ...args);
}

function logD(arg1: any, ...args: any): void {
	getLogger().debug(arg1, ...args);
}

function logI(arg1: any, ...args: any): void {
	getLogger().info(arg1, ...args);
}

function logW(arg1: any, ...args: any): void {
	getLogger().warn(arg1, ...args);
}

function logE(arg1: any, ...args: any): void {
	getLogger().error(arg1, ...args);
}

function errorToString(value: any): string {
	if (value === null || value === undefined) {
		return "null";
	}

	let text;
	try {
		text = JSON.stringify(value);
	} catch {
		try {
			text = value.toString();
		} catch {
			text = "not stringable";
		}
	}

	text += `\n at: ${value.stack} `;

	if (value.details) {
		text += `\n details: ${errorToString(value.details)}`;
	}

	return text;
}

function isFile(folder: any, file: any): boolean {
	return fs.lstatSync(path.join(folder, file)).isFile();
}

function endsWith(file: any, extensions: string[]): boolean {
	file = file.toLowerCase();

	return extensions.some((ext: any): boolean => file.endsWith(ext));
}

function getMaxDate(): Date {
	return moment("9999-12-31 23:59:59 999", "YYYY-MM-DD HH:mm:ss SSS").toDate();
}

function getPhotoLibUrl(): string {
	return `${config.get("server.host")}:${config.get("server.port")}`;
}

/**
 * Return relative path of file in project. No need to use path in clumsy way "../../src/routes" but just "/src/routes"
 * @param relativePath 
 */
function getPath(relativePath: string): string {
	return appRootPath.resolve(relativePath);
}

function hasEnumValue(checkedEnum: any, value: string, silent: boolean = true): boolean {

	if (!checkedEnum[value]) {
		if (silent === true) {
			return false;
		} else {
			/* TODO here should be provided Enum name */
			throw new PhotoError(`Supported values are ${JSON.stringify(checkedEnum)}`);
		}
	}
	return true;
}


function hasEnumValues(checkedEnum: any, values: string[], silent: boolean = true): boolean {

	if ((values.some(value => !checkedEnum[value]))) {
		if (silent === true) {
			return false;
		} else {
			/* TODO here should be provided Enum name */
			throw new PhotoError(`Supported values are ${JSON.stringify(checkedEnum)}`);
		}
	}
	return true;
}


export {
	PhotoError, PhotoAuthenticationError,
	sendData,
	meOrNull, meOrVal,
	toBoolean,
	deleteFromArray,
	strIsEmtpy,
	strNotEmp,
	waitFor,
	logS, logD, logI, logW, logE,
	errorToString,
	isFile, endsWith,
	getMaxDate,
	getPhotoLibUrl,
	getPath,
	hasEnumValue, hasEnumValues
};
