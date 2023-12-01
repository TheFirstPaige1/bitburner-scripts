import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.singularity.stopAction();
	const willfocus = !ns.singularity.getOwnedAugmentations().includes("Neuroreceptor Management Implant");
	const progs = ["AutoLink.exe", "BruteSSH.exe", "DeepscanV1.exe", "ServerProfiler.exe", "FTPCrack.exe",
		"relaySMTP.exe", "DeepscanV2.exe", "HTTPWorm.exe", "SQLInject.exe"];
	for (const prog of progs) {
		if (!ns.fileExists(prog, "home")) {
			while (!ns.singularity.createProgram(prog, willfocus)) { await ns.sleep(10000); }
			while (!ns.fileExists(prog, "home")) { await ns.sleep(10000); }
		}
	}
}