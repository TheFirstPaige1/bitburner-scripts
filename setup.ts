import { NS } from "@ns";
import { hasFocusPenalty, masterLister, moneyTimeKill } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	for (const serv of masterLister(ns)) { ns.scp(ns.ls(serv, ".lit"), "home", serv); }
	for (const fac of ns.singularity.checkFactionInvitations())	{ ns.singularity.joinFaction(fac); }
	const focus = hasFocusPenalty(ns);
	ns.scriptKill("totalhack.js", "home");
	ns.run("totalhack.js");
	ns.singularity.universityCourse("Rothman University", "Computer Science", focus);
	await ns.sleep(Math.max(1, (300000 - (Date.now() - ns.getResetInfo().lastAugReset))));
	const progs = ["BruteSSH.exe", "FTPCrack.exe"];
	const dwprogs = ["relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
	for (const prog of progs) {
		if (!ns.fileExists(prog, "home")) {
			while (!ns.singularity.createProgram(prog, focus)) {
				ns.singularity.universityCourse("Rothman University", "Computer Science", focus);
				await ns.sleep(10000);
			}
			while (!ns.fileExists(prog, "home")) { await ns.sleep(10000); }
		}
	}
	while (!ns.singularity.purchaseTor()) { await moneyTimeKill(ns, focus); }
	ns.singularity.stopAction();
	for (const dwprog of dwprogs) { if (!ns.fileExists(dwprog, "home")) { while (!ns.singularity.purchaseProgram(dwprog)) { await moneyTimeKill(ns, focus); } } }
	ns.singularity.stopAction();
	/* for now, find a new home for this
	const exprogs = ["AutoLink.exe", "DeepscanV1.exe", "ServerProfiler.exe", "DeepscanV2.exe"];
	for (const exprog of exprogs) {
		if (!ns.fileExists(exprog, "home")) {
			while (!ns.singularity.createProgram(exprog, focus)) { await ns.sleep(10000); }
			while (!ns.fileExists(exprog, "home")) { await ns.sleep(10000); }
		}
	}
	*/
	ns.run("factionfarmer.js");
}