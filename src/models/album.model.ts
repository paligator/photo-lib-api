import mongoose, { Schema, Document } from "mongoose";

export interface IAlbum extends Document {
	continent: string;
	year: number;
	month: number;
	name: string;
	path: string;
	//FIXME: Do I really neeed files?
	files: string[];
	photos: IPhoto[];
}

export interface IPhoto {
	name: string;
	tags: string[];
}

export const AlbumSchema = new Schema({
	continent: { type: String, required: true, max: 20 },
	year: { type: Number, required: true },
	month: { type: Number, required: true },
	name: { type: String, unique: true, index: true, required: true, max: 50 },
	path: { type: String, required: true, max: 350 },
	countries: { type: Array },
	photos: [
		{
			_id: false,
			name: { type: String, unique: true, index: true },
			tags: []
		}
	]
}, { timestamps: true });

//module.exports = mongoose.model("Albums", AlbumSchema);
const Album = mongoose.model<IAlbum>("Album", AlbumSchema);

export default Album;
