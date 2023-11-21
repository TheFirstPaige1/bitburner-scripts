import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	let dwprogs = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"]
	for (let i = 0; i < dwprogs.length; i++) {
		if (ns.fileExists(dwprogs[i], "home")) {
			dwprogs.slice(i, 1);
			i--;
		}
	}
	while (dwprogs.length > 0) {
		if (ns.singularity.purchaseTor()) {
			while (dwprogs.length > 0) {
				if (ns.singularity.purchaseProgram(dwprogs[0])) {
					dwprogs.slice(0, 1);
				} else {
					await ns.sleep(60000);
				}
			}
		} else {
			await ns.sleep(60000);
		}
	}
}