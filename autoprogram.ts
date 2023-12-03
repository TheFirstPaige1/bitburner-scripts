import { NS } from "@ns";
import { hasFocusPenalty } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	ns.singularity.stopAction();
	const willfocus = hasFocusPenalty(ns);
	const progs = ["AutoLink.exe", "BruteSSH.exe", "DeepscanV1.exe", "ServerProfiler.exe", "FTPCrack.exe",
		"relaySMTP.exe", "DeepscanV2.exe"];
	const dwprogs = ["HTTPWorm.exe", "SQLInject.exe"];
	for (const prog of progs) {
		if (prog == "DeepscanV2.exe") {
			for (const dwprog of dwprogs) { if (!ns.fileExists(dwprog, "home")) { while (!ns.singularity.purchaseProgram(dwprog)) { await ns.sleep(10000); } } }
		}
		if (!ns.fileExists(prog, "home")) {
			while (!ns.singularity.createProgram(prog, willfocus)) { await ns.sleep(10000); }
			while (!ns.fileExists(prog, "home")) { await ns.sleep(10000); }
		}
	}
}