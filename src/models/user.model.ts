import mongoose, { Schema, Document } from "mongoose";
import * as C from "../helpers/common";
import bcrypt from "bcrypt";
import * as enums from "../helpers/enums";

export interface IUser extends Document {
	email: string;
	name: string;
	validTo: Date;
	password: string;
	roles: string[];
	validatePassword(candidatePassword: string): Promise<boolean>;
	isExpired(): boolean;
	isNotExpired(): boolean;
}

export const UserSchema = new Schema({
	email: { type: String, unique: true },
	name: { type: String, required: true, max: 50 },
	password: { type: String },
	validTo: { type: Date, required: true, default: C.getMaxDate() },
	//TODO: check only for enums, now any value can be set
	roles: { type: [String], default: [enums.UserRoles.Guest], required: true },
}, { timestamps: true });



UserSchema.pre<IUser>("save", async function (next) {
	const user = this;

	if (!user.isModified("password")) { return next(); }

	const hashedPassword = await bcrypt.hash(user.password, 10);
	user.password = hashedPassword;
	next();

});


UserSchema.methods.isExpired = function (): boolean {
	return this.validTo < new Date();
};

UserSchema.methods.isNotExpired = function (): boolean {
	return !this.isExpired();
};

UserSchema.methods.validatePassword = async function (candidatePassword: string): Promise<boolean> {
	return new Promise((resolve): void => {
		bcrypt.compare(candidatePassword, this.password, function (err: Error, isMatch: boolean) {

			if (err) throw (err);

			resolve(isMatch);
		});
	});
};


const User = mongoose.model<IUser>("User", UserSchema);

export default User;
