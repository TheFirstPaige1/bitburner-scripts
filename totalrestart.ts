import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.scriptKill("totalhack.js", "home");
	ns.scriptKill("manshare.js", "home");
	ns.run("totalhack.js");
	ns.run("manshare.js", Math.trunc(ns.getServerMaxRam("home") / 8));
}