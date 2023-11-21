import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.scriptKill("totalhack.js", "home");
	ns.run("totalhack.js");
}