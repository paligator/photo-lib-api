import * as C from "../helpers/common";
import fs from "fs";
import rimraf from "rimraf";

async function getFiles(folder: string, onlyFiles: boolean = true, extensions: any = null): Promise<any> {

	return new Promise((resolve, reject): any => {
		return fs.readdir(folder, (err: any, files: any): any => {

			if (err) {
				C.logE("Error read folder: ", err);
				return reject(err);
			}

			const aa = files.filter((file: any): any => {

				//exclude directory
				if (onlyFiles && !C.isFile(folder, file)) {
					return false;
				}

				//exclude files don"t end with extension
				if (extensions && !C.endsWith(file, extensions)) {
					return false;
				}

				return true;
			});

			resolve(aa);
		});
	}
	);
}

async function getImages(folder: any): Promise<string[]> {
	return await getFiles(folder, true, [".jpg", ".jpeg", ".png", ".gif"]);
}

function mkdir(path: any): void {
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path, { recursive: true });
	}
}

/**
 * Remove folder
 * 
 * @param path 
 * @param rf remove even not emtpy folder, the same as unix commadn rm -rf /aaa/bb
 */
function rmdir(path: any, rf: boolean = false): void {
	if (fs.existsSync(path)) {
		if (rf === true) {
			rimraf.sync(path);
		} else {
			fs.rmdirSync(path);
		}
	}
}

function exists(path: any): boolean {
	return fs.existsSync(path);
}


export {
	getImages,
	mkdir, rmdir,
	exists
};
