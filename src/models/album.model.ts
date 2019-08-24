import mongoose, { Schema, Document } from "mongoose";

export interface AlbumInt extends Document {
	continent: string;
	year: number;
	month: number;
	name: string;
	path: string;
	favourites: string[];
}

export const AlbumSchema = new Schema({
	continent: { type: String, required: true, max: 20 },
	year: { type: Number, required: true },
	month: { type: Number, required: true },
	name: { type: String, unique: true, required: true, max: 50 },
	path: { type: String, required: true, max: 350 },
	favourites: { type: Array },
	countries: { type: Array },
}, { timestamps: true });

//module.exports = mongoose.model("Albums", AlbumSchema);
const Album = mongoose.model<AlbumInt>("Album", AlbumSchema);

export default Album;
