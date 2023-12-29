import { NS } from "@ns";
import {
	hasFocusPenalty, quietTheBabblingThrong, moneyTimeKill, createWorklist, desiredfactions, factionHasAugs,
	masterLister, joinEveryInvitedFaction, checkFactionEnemies, joinThisFaction
} from "./bitlib";
export async function main(ns: NS): Promise<void> {
	ns.killall("home", true);
	const focus = hasFocusPenalty(ns);
	if (focus) { ns.tail(); }
	const sing = ns.singularity;
	quietTheBabblingThrong(ns);
	for (const serv of masterLister(ns)) { ns.scp(ns.ls(serv, ".lit"), "home", serv); }
	joinEveryInvitedFaction(ns);
	ns.run("totalhack.js");
	sing.universityCourse("Rothman University", "Computer Science", focus);
	await ns.sleep(Math.max(1, (300000 - (Date.now() - ns.getResetInfo().lastAugReset))));
	const progs = ["BruteSSH.exe", "FTPCrack.exe"];
	const dwprogs = ["relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
	for (const prog of progs) {
		if (!ns.fileExists(prog, "home")) {
			while (!sing.createProgram(prog, focus)) {
				sing.universityCourse("Rothman University", "Computer Science", focus);
				await ns.sleep(10000);
			}
			while (!ns.fileExists(prog, "home")) { await ns.sleep(10000); }
		}
	}
	ns.run("h4ckrnet.js");
	while (!sing.purchaseTor()) { await moneyTimeKill(ns, focus); }
	sing.stopAction();
	for (const dwprog of dwprogs) {
		if (!ns.fileExists(dwprog, "home")) {
			while (!sing.purchaseProgram(dwprog)) { await moneyTimeKill(ns, focus); }
		}
	}
	sing.stopAction();
	let npid = ns.run("nettrawler.js");
	while (ns.isRunning(npid)) { await moneyTimeKill(ns, focus); }
	ns.run("serverstager.js", 1, Math.trunc(ns.getServerMaxRam("home") / 2));
	ns.run("stockwatcher.js");
	const augqueue = 7 - (sing.getOwnedAugmentations(true).length - sing.getOwnedAugmentations(false).length);
	sing.stopAction();
	let worklist = createWorklist(ns, augqueue);
	let iterator = 0;
	while (worklist.length < augqueue && iterator < desiredfactions.length) {
		let pokefac = desiredfactions[iterator];
		ns.print("poking " + pokefac + "...");
		if (factionHasAugs(ns, pokefac) && checkFactionEnemies(ns, pokefac)) {
			joinThisFaction(ns, pokefac, focus);
			worklist = createWorklist(ns, augqueue);
		}
		iterator++;
	}
	sing.stopAction();
	joinEveryInvitedFaction(ns);
	worklist = createWorklist(ns, augqueue);
	sing.stopAction();
	for (const aug of worklist) {
		ns.tprint((worklist.length - worklist.indexOf(aug)) + ": " + aug + ", "
			+ ns.formatNumber(sing.getAugmentationRepReq(aug)) + ", "
			+ sing.getAugmentationFactions(aug).toString());
	}
	ns.run("servershare.js");
	for (const targaug of worklist) {
		if (!sing.getAugmentationFactions(targaug).some(fac => sing.getFactionRep(fac) >= sing.getAugmentationRepReq(targaug))) {
			if (!ns.gang.inGang() || (ns.gang.inGang() && !sing.getAugmentationFactions(targaug).includes(ns.gang.getGangInformation().faction))) {
				let workfac = sing.getAugmentationFactions(targaug).filter(fac => ns.getPlayer().factions.includes(fac)).sort((a, b) => {
					return sing.getFactionFavor(b) - sing.getFactionFavor(a);
				})[0];
				ns.print("aiming to get " + targaug + " from " + workfac + "...");
				if (!sing.workForFaction(workfac, "hacking", focus)) { sing.workForFaction(workfac, "field", focus) }
				while (sing.getFactionRep(workfac) < sing.getAugmentationRepReq(targaug)) {
					if (sing.getFactionFavor(workfac) >= ns.getFavorToDonate()) {
						sing.donateToFaction(workfac, Math.max(10000000, Math.trunc(ns.getServerMoneyAvailable("home") / 4)))
					}
					await ns.sleep(60000);
				}
				sing.stopAction();
			}
		}
	}
	for (const targaug of worklist) {
		let targfac = sing.getAugmentationFactions(targaug).sort((a, b) => { return sing.getFactionRep(b) - sing.getFactionRep(a); })[0];
		ns.print("buying " + targaug + " from " + targfac + "...");
		while (!sing.purchaseAugmentation(targfac, targaug)) { await moneyTimeKill(ns, focus); }
	}
	joinEveryInvitedFaction(ns);
	ns.scriptKill("stockwatcher.js", "home");
	let spid = ns.run("bailwse.js");
	while (ns.isRunning(spid)) { await moneyTimeKill(ns, focus); }
	const excludedfacs = ["Bladeburners", "Church of the Machine God", "Shadows of Anarchy"];
	let factions = ns.getPlayer().factions;
	factions = factions.filter(fac => !excludedfacs.includes(fac));
	if (ns.gang.inGang()) { factions = factions.filter(fac => ns.gang.getGangInformation().faction != fac); }
	factions = factions.sort((a, b) => { return sing.getFactionRep(b) - sing.getFactionRep(a); })
	let hpid = ns.run("hashout.js");
	while (ns.isRunning(hpid)) { await moneyTimeKill(ns, focus); }
	while (sing.upgradeHomeRam()) { await ns.sleep(10); }
	while (sing.upgradeHomeCores()) { await ns.sleep(10); }
	while (sing.purchaseAugmentation(factions[0], "NeuroFlux Governor")) { await ns.sleep(10); }
	if (ns.getResetInfo().currentNode == 2 && ns.gang.inGang()) { sing.purchaseAugmentation(ns.gang.getGangInformation().faction, "The Red Pill"); }
	else { sing.purchaseAugmentation("Daedalus", "The Red Pill"); }
	if (sing.getOwnedAugmentations().includes("The Red Pill") && (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel("w0r1d_d43m0n"))) {
		ns.tprint("GO BACKDOOR w0r1d_d43m0n");
	} else {
		sing.installAugmentations("patsy.js");
	}
}