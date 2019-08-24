import { ContextResponse, PathParam } from "typescript-rest";
import express from "express";
import * as fs from "../helpers/fs";
import * as C from "../helpers/common";
import config from "config";
import fsnativ from "fs";
import path from "path";
import Album, { AlbumInt } from "../models/album.model";
import { ExifImage, ExifData } from "exif";
import { getRedisClient } from "../helpers/redis-client";

const { ObjectID } = require("mongoose").mongo;

class PhotoService {

	private static redis = getRedisClient();
	private static storageUrl: string = config.get("paths.photoFolder");
	private static cachedImageTTL: number = parseInt(config.get("redisClient.cachedImageTTL"));

	public static async getAlbum(albumId: string, albumName: string): Promise<any> {

		if ((!albumId || albumId == "undefined") && (!albumName || albumName == "undefined")) {
			throw new C.PhotoError("Album id is not defined");
		}

		let album;
		if (albumId) {
			album = await Album.findOne({ _id: new ObjectID(albumId) });
		} else {
			album = await Album.findOne({ name: albumName });
		}

		if (!album) {
			throw new C.PhotoError(`E001: Album ${albumId || albumName} doesn't exist`);
		}

		const folder = path.join(config.get("paths.photoFolder"), album.path);
		const files = await fs.getImages(folder);

		return {
			id: album._id,
			name: album.name,
			year: album.year,
			month: album.month,
			continent: album.continent,
			url: `${config.get("paths.photoUrl")}/${album.path}`,
			files: files,
			favourites: C.meOrVal(album.favourites, [])
		};

	}

	public static async getAlbums(): Promise<any> {
		let albums = await Album.find({});
		albums = albums.map((a: any): any => (
			{
				id: a._id.toString(),
				continent: a.continent,
				year: a.year,
				month: a.month,
				name: a.name,
				countries: a.countries
			}
		));
		return albums;
	}

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

		const album: AlbumInt = await Album.findOne({ _id: albumId });
		const fotoPath = path.join(config.get("paths.photoFolder"), album.path, photoName);

		return await new Promise((resolve, reject): any => {
			new ExifImage({ image: fotoPath }, function (err: Error | null, exifData: ExifData): any {
				if (err) {
					reject(new C.PhotoError("Picture has no exif", err));
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

export {
	PhotoService
};