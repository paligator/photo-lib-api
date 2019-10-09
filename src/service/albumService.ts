import * as fs from "../helpers/fs";
import * as C from "../helpers/common";
import config from "config";
import path from "path";
import Album, { IAlbum } from "../models/album.model";

const { ObjectID } = require("mongoose").mongo;

export default class AlbumService {

	public static async getAlbum(albumId: string, loadPhotos: boolean = false): Promise<IAlbum> {

		if (!albumId || albumId == "undefined") {
			throw new C.PhotoError("Album id is not defined");
		}

		let album = await Album.findOne({ _id: new ObjectID(albumId) });

		if (!album) {
			throw new C.PhotoError(`E001: Album ${albumId} doesn't exist`);
		}

		if (loadPhotos === true) {
			album.files = await this.getAlbumPhotos(album.path);
		}

		return album;
	}

	public static async getAlbumByName(albumName: string, loadPhotos: boolean = false): Promise<IAlbum> {

		if (!albumName || albumName == "undefined") {
			throw new C.PhotoError("Album name is not defined");
		}

		let album = await Album.findOne({ name: albumName });

		if (!album) {
			throw new C.PhotoError(`E001: Album ${albumName} doesn't exist`);
		}

		if (loadPhotos === true) {
			album.files = await this.getAlbumPhotos(album.path);
		}

		return album;
	}

	private static async getAlbumPhotos(albumPath: string) {
		const folder = path.join(config.get("paths.photoFolder"), albumPath);
		const files = await fs.getImages(folder);
		return files;
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
				countries: a.countries,
				path: a.path
			}
		));
		return albums;
	}
}