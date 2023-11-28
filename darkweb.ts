import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	let dwprogs = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
	while (!ns.singularity.purchaseTor()) { await ns.sleep(60000); }
	for (const dwprog of dwprogs) { if (!ns.fileExists(dwprog, "home")) { while (!ns.singularity.purchaseProgram(dwprog)) { await ns.sleep(60000); } } }
}
