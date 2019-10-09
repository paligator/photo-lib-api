import { ContextResponse, PathParam } from "typescript-rest";
import express from "express";
import * as fs from "../helpers/fs";
import * as C from "../helpers/common";
import config from "config";
import fsnativ from "fs";
import path from "path";
import Album, { IAlbum } from "../models/album.model";
import { ExifImage, ExifData } from "exif";
import { getRedisClient } from "../helpers/redis-client";

export default class PhotoService {

	private static redis = getRedisClient();
	private static storageUrl: string = config.get("paths.photoFolder");
	private static cachedImageTTL: number = parseInt(config.get("redisClient.cachedImageTTL"));

	public static async setPhotoFavourite(albumId: string, photoName: string, status: boolean): Promise<any> {

		const album = await Album.findOne({ _id: albumId });

		const acutallyIsFavourite = album.favourites.some((photo: string): boolean => (photo === photoName));
		let saveAlbum = false;

		if (status === true && acutallyIsFavourite === false) {
			album.favourites.push(photoName);
			saveAlbum = true;
		} else if (status === false && acutallyIsFavourite === true) {
			C.deleteFromArray(album.favourites, photoName);
			saveAlbum = true;
		}

		if (saveAlbum === true) {
			await album.save();
		}

		return true;

	}

	public static async getExifInfo(albumId: string, photoName: string): Promise<any> {

		if (C.strIsEmtpy(albumId) || C.strIsEmtpy(photoName)) {
			throw new C.PhotoError("Invalid request data");
		}

		const album: IAlbum = await Album.findOne({ _id: albumId });
		const fotoPath = path.join(config.get("paths.photoFolder"), album.path, photoName);

		if (!fs.exists(fotoPath)) {
			throw new C.PhotoError(`${photoName} in album ${albumId} doesn't exists`);
		}

		return await new Promise((resolve): any => {
			new ExifImage({ image: fotoPath }, function (err: Error | null, exifData: ExifData): any {
				if (err) {

					// FIXME: better don't use ts-ignore. And ts-ignore all error not only mentioned TS2339
					// @ts-ignore: TS2339
					if (err.code === "NO_EXIF_SEGMENT") {
						C.logS(`Photo has no exif ${fotoPath}`);
					} else {
						C.logE(`Couldn't get exif ${fotoPath}`, err);
					}
					resolve({});
				} else
					resolve({
						createDate: exifData.exif.CreateDate,
						orientation: exifData.image.Orientation,
						camera: `${exifData.image.Make} ${exifData.image.Model} `
					});
			});
		});
	}

	public static async getThumbnail(@PathParam("imagePath") imagePath: string, @ContextResponse res: express.Response): Promise<any> {

		try {

			const cacheKey = `thumb_${imagePath}`;

			// get image from cache
			const cachedImage = await PhotoService.redis.getValue(cacheKey);

			// if image is cached, will be returned from cache
			if (cachedImage) {

				C.logI(`getThumbnail get from cache ${cacheKey}`);

				// to keep image in cache another X days after last read
				PhotoService.redis.setExpire(cacheKey, PhotoService.cachedImageTTL);

				res.setHeader("Cache-Control", "public, max-age=1800"); /* 1800 seconds == 30 minutes */
				res.contentType("image/png");
				res.send(Buffer.from(cachedImage));

			} else {

				C.logI(`getThumbnail create thumbnail for ${cacheKey}`);

				const imagePathParsed = path.parse(imagePath);
				const imageUrl = path.join(PhotoService.storageUrl, imagePathParsed.dir, "thumbs", imagePathParsed.base);
				const imageBuffer: Buffer = fsnativ.readFileSync(imageUrl);

				PhotoService.redis.setValue(cacheKey, imageBuffer, PhotoService.cachedImageTTL);

				res.contentType("image/png");
				res.send(imageBuffer);

			}
		} catch (err) {
			throw new C.PhotoError("Problem getThumbnail", err);
		}

	}

	public static async getPreview(@PathParam("imagePath") imagePath: string, @ContextResponse res: express.Response): Promise<any> {
		try {

			const imagePathParsed = path.parse(imagePath);
			const imageUrl = path.join(PhotoService.storageUrl, imagePathParsed.dir, "prevs", imagePathParsed.base);
			const imageBuffer = fsnativ.readFileSync(imageUrl);

			res.contentType("image/png");
			res.send(imageBuffer);

		} catch (err) {
			throw new C.PhotoError("Problem getPreview", err);
		}
	}

	
}