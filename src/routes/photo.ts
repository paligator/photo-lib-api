import { Path, GET, ContextResponse, PathParam } from "typescript-rest";
import express from "express";
import * as C from "../helpers/common";
import config from "config";
import fsnativ from "fs";
import path from "path";
import { getRedisClient } from "../helpers/redis-client";
import { emit, EVENT_SEND_EMAIL } from "../helpers/events";

@Path("/photo")
class PhotoRoute {

	private redis = getRedisClient();
	private storageUrl: string = config.get("paths.photoFolder");
	private cachedImageTTL: number = parseInt(config.get("redisClient.cachedImageTTL"));

	@Path("test")
	@GET
	public async test(): Promise<any> {
		try {
			emit(EVENT_SEND_EMAIL, { to: "paligator@gmail.com", subject: "New Comment cc", body: "From: paligator ('paligator@gmail.com'):  nazdar nazdar" });
			C.logI("ale som tu a testujem:)");
		} catch (err) {
			throw new C.PhotoError("Problem with test", err);
		}
	}


	@Path("thumb/:imagePath(*)")
	@GET
	public async getThumbnail(@PathParam("imagePath") imagePath: string, @ContextResponse res: express.Response): Promise<any> {

		// if (imagePath.endsWith("2019-04-14__11-59-46__0005.JPG")) {
		// 	throw new C.PhotoError("Umela chyba");
		// }

		try {

			const cacheKey = `thumb_${imagePath}`;

			// get image from cache
			const cachedImage = await this.redis.getValue(cacheKey);

			// if image is cached, will be returned from cache
			if (cachedImage) {

				C.logI(`getThumbnail get from cache ${cacheKey}`);

				// to keep image in cache another X days after last read
				this.redis.setExpire(cacheKey, this.cachedImageTTL);

				res.setHeader("Cache-Control", "public, max-age=2419200"); /* 1800 seconds == 30 minutes */
				res.contentType("image/png");
				res.send(Buffer.from(cachedImage));

			} else {

				C.logI(`getThumbnail create thumbnail for ${cacheKey}`);

				const imagePathParsed = path.parse(imagePath);
				const imageUrl = path.join(this.storageUrl, imagePathParsed.dir, "thumbs", imagePathParsed.base);
				const imageBuffer: Buffer = fsnativ.readFileSync(imageUrl);

				this.redis.setValue(cacheKey, imageBuffer, this.cachedImageTTL);

				res.setHeader("Cache-Control", "public, max-age=2419200"); /* 4 weeks */
				res.contentType("image/png");
				res.send(imageBuffer);

			}
		} catch (err) {
			throw new C.PhotoError("Problem getThumbnail", err);
		}

	}

	@Path("prev/:imagePath(*)")
	@GET
	public async getPreview(@PathParam("imagePath") imagePath: string, @ContextResponse res: express.Response): Promise<any> {
		try {

			const imagePathParsed = path.parse(imagePath);
			const imageUrl = path.join(this.storageUrl, imagePathParsed.dir, "prevs", imagePathParsed.base);
			const imageBuffer = fsnativ.readFileSync(imageUrl);

			res.contentType("image/png");
			res.setHeader("Cache-Control", "public, max-age=2419200"); /* 4 weeks */
			res.send(imageBuffer);

		} catch (err) {
			throw new C.PhotoError("Problem getPreview", err);
		}
	}

	@Path("video")
	@GET
	public async getVideo(@PathParam("videoPath") imagePath: string, @ContextResponse res: express.Response): Promise<any> {
		try {

			const path = "c:/temp/__0006.MOV";
			const stat = fsnativ.statSync(path);
			const fileSize = stat.size;
			// const range = req.headers.range;
			// if (range) {
			// 	const parts = range.replace(/bytes=/, "").split("-")
			// 	const start = parseInt(parts[0], 10)
			// 	const end = parts[1] 
			// 		? parseInt(parts[1], 10)
			// 		: fileSize-1
			// 	const chunksize = (end-start)+1
			// 	const file = fs.createReadStream(path, {start, end})
			// 	const head = {
			// 		'Content-Range': `bytes ${start}-${end}/${fileSize}`,
			// 		'Accept-Ranges': 'bytes',
			// 		'Content-Length': chunksize,
			// 		'Content-Type': 'video/mp4',
			// 	}
			// 	res.writeHead(206, head);
			// 	file.pipe(res);
			// } else {
			const head = {
				"Content-Length": fileSize,
				"Content-Type": "video/mp4",
			};
			res.writeHead(200, head);
			fsnativ.createReadStream(path).pipe(res);

		} catch (err) {
			throw new C.PhotoError("Problem getPreview", err);
		}
	}

}

export default PhotoRoute;
