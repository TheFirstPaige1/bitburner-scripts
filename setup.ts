import { NS } from "@ns";
import { hasFocusPenalty } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	const focus = hasFocusPenalty(ns);
	ns.run("totalhack.js");
	ns.singularity.universityCourse("Rothman University", "Computer Science");
}