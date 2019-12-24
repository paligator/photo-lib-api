import { ContextResponse, PathParam } from "typescript-rest";
import express from "express";
import * as fs from "../helpers/fs";
import * as C from "../helpers/common";
import config from "config";
import fsnativ from "fs";
import path from "path";
import Album, { IAlbum, IPhoto, IComment } from "../models/album.model";
import { ExifImage, ExifData } from "exif";
import { getRedisClient } from "../helpers/redis-client";
import { PhotoTag } from "../helpers/enums";
import { AlbumService } from "../service";
import { RequestContext } from "../types/temporaryAll";

export default class PhotoService {

	private static redis = getRedisClient();
	private static storageUrl: string = config.get("paths.photoFolder");
	private static cachedImageTTL: number = parseInt(config.get("redisClient.cachedImageTTL"));

	public static async setPhotoTags(albumId: string, photoName: string, addTags: [] = [], removeTags: any = []): Promise<any> {

		C.hasEnumValues(PhotoTag, addTags, false);

		const album: IAlbum = await Album.findOne({ _id: albumId });

		let photo: IPhoto = album.photos.find((photo) => { return photo.name === photoName; });
		if (!photo) {
			photo = {
				name: photoName,
				comments: null,
				tags: addTags,
			};
			album.photos.push(photo);
		} else {
			//remove tags
			photo.tags = photo.tags.filter((tag: string) => removeTags.indexOf(tag) < 0);
			//add tags, check duplicates
			photo.tags.push(...addTags.filter((tag: string) => photo.tags.indexOf(tag) < 0));
		}

		//if no tags left, photo is delete at all
		if (photo.tags.length === 0) {
			album.photos = album.photos.filter(item => item.name !== photo.name);
		}

		await album.save();

		return true;
	}

	public static async addPhotoComment(context: RequestContext, albumId: string, photoName: string, comment: string): Promise<boolean> {
		const album: IAlbum = await Album.findOne({ _id: albumId });

		let photo: IPhoto = album.photos.find((photo) => { return photo.name === photoName; });

		const newComment: IComment = {
			comment,
			username: context.userName,
			userEmail: context.userEmail,
		};

		if (!photo) {
			photo = {
				name: photoName,
				comments: [newComment],
				tags: [],
			};
			album.photos.push(photo);
		} else {
			photo.comments.push(newComment);
		}

		await album.save();

		return true;
	}

	public static async getPhotoDetails(albumId: string, photoName: string): Promise<IPhoto> {
		if (C.strIsEmtpy(albumId) || C.strIsEmtpy(photoName)) {
			throw new C.PhotoError("Invalid request data");
		}

		const album: IAlbum = await Album.findOne({ _id: albumId });
		const photo: IPhoto = album.photos.find((photo) => { return photo.name === photoName; });

		return photo;

	}


	public static async getPhotosByTags(albumName: string, tags: string[]) {

		const album: IAlbum = await AlbumService.getAlbumByName(albumName, false);

		// if no tag is selected, we return no photos in category notTagged
		if (!tags || tags.length === 0) {
			return [{ tag: "notTagged", photos: [] }];
		}

		const photos = [];

		tags.forEach(regTag => {
			const taggedPhotos: string[] = album.photos.filter((photo: IPhoto) => photo.tags.some((tag: string) => tag === regTag)).map(photo => photo.name);

			photos.push({ tag: regTag, photos: taggedPhotos });
		});

		// get not tagged photos
		if (tags.includes("notTagged")) {
			const allPhotos = await AlbumService.getAlbumPhotos(album.path);
			const notTaggedPhotos = allPhotos.filter(file => {
				return !album.photos.some(photo => photo.name === file && photo.tags.length > 0);
			});
			photos.push({ tag: "notTagged", photos: notTaggedPhotos });
		}

		return photos;
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
					// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
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