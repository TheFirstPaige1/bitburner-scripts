import { NS } from "@ns";
import { hasFocusPenalty, masterLister, moneyTimeKill, quietTheBabblingThrong } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	ns.killall("home", true);
	const focus = hasFocusPenalty(ns);
	if (focus) { ns.tail(); }
	quietTheBabblingThrong(ns);
	for (const serv of masterLister(ns)) { ns.scp(ns.ls(serv, ".lit"), "home", serv); }
	for (const fac of ns.singularity.checkFactionInvitations()) { ns.singularity.joinFaction(fac); }
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
	let hpid = ns.run("h4ckrnet.js");
	while (ns.isRunning(hpid)) { await moneyTimeKill(ns, focus); }
	ns.run("babysitter.js");
	while (!ns.singularity.purchaseTor()) { await moneyTimeKill(ns, focus); }
	ns.singularity.stopAction();
	for (const dwprog of dwprogs) { if (!ns.fileExists(dwprog, "home")) { while (!ns.singularity.purchaseProgram(dwprog)) { await moneyTimeKill(ns, focus); } } }
	ns.singularity.stopAction();
	let npid = ns.run("nettrawler.js");
	while (ns.isRunning(npid)) { await moneyTimeKill(ns, focus); }
	ns.run("factionfarmer.js");
	ns.run("serverstager.js", 1, Math.trunc(ns.getServerMaxRam("home") / 2));
	ns.run("stockwatcher.js");
}