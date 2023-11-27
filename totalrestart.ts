import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.scriptKill("totalhack.js", "home");
	if (!ns.fileExists("sourcefiles.txt", "home")) {
		ns.run("sourcefiler.js");
		await ns.sleep(10);
	}
	if (!ns.fileExists("networkmap.txt", "home")) {
		ns.run("netscanner.js");
		await ns.sleep(10);
	}
	ns.run("totalhack.js");
}