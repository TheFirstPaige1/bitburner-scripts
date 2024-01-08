import { NS } from "@ns";
import {
	hasFocusPenalty, quietTheBabblingThrong, moneyTimeKill, createWorklist, desiredfactions, factionHasAugs,
	masterLister, joinEveryInvitedFaction, checkFactionEnemies, joinThisFaction, wrapNS, getWaitingCount
} from "./bitlib";
export async function main(ns: NS): Promise<void> {
	ns.killall("home", true);
	const wns = wrapNS(ns);
	const focus = await hasFocusPenalty(ns);
	if (focus) { ns.tail(); }
	const sing = ns.singularity;
	const wsing = wns.singularity;
	quietTheBabblingThrong(ns);
	for (const serv of masterLister(ns)) { ns.scp(ns.ls(serv, ".lit"), "home", serv); }
	joinEveryInvitedFaction(ns);
	ns.run("totalhack.js");
	ns.run("ganggang.js");
	sing.universityCourse("Rothman University", "Computer Science", focus);
	await ns.sleep(Math.max(1, (300000 - (Date.now() - ns.getResetInfo().lastAugReset))));
	const progs = ["BruteSSH.exe", "FTPCrack.exe"];
	const dwprogs = ["relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
	for (const prog of progs) {
		if (!ns.fileExists(prog, "home")) {
			while (!(await wsing.createProgramD(prog, focus))) {
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
	const waitingcount = await getWaitingCount(ns);
	const augqueue = Math.max(0, (7 - waitingcount));
	sing.stopAction();
	let worklist = await createWorklist(ns, augqueue);
	let iterator = 0;
	while (worklist.length < augqueue && iterator < desiredfactions.length) {
		let pokefac = desiredfactions[iterator];
		ns.print("poking " + pokefac + "...");
		if (await factionHasAugs(ns, pokefac) && checkFactionEnemies(ns, pokefac)) {
			await joinThisFaction(ns, pokefac, focus);
			worklist = await createWorklist(ns, augqueue);
		}
		iterator++;
	}
	sing.stopAction();
	joinEveryInvitedFaction(ns);
	worklist = await createWorklist(ns, augqueue);
	sing.stopAction();
	for (const aug of worklist) {
		ns.tprint((worklist.length - worklist.indexOf(aug)) + ": " + aug + ", "
			+ ns.formatNumber(sing.getAugmentationRepReq(aug)) + ", "
			+ (await wsing.getAugmentationFactionsD(aug)).toString());
	}
	ns.run("servershare.js");
	let gangaugs = [] as string[];
	let gangfac = "";
	let buylist = [] as string[];
	if (ns.gang.inGang()) {
		gangfac = ns.gang.getGangInformation().faction
		gangaugs = await wsing.getAugmentationsFromFactionD(gangfac);
	}
	for (const targaug of worklist) {
		if (!gangaugs.includes(targaug)) {
			let augfacs = await wsing.getAugmentationFactionsD(targaug);
			if (!augfacs.some(fac => sing.getFactionRep(fac) >= sing.getAugmentationRepReq(targaug))) {
				let workfac = augfacs.filter(fac => ns.getPlayer().factions.includes(fac)).sort((a, b) => {
					return sing.getFactionFavor(b) - sing.getFactionFavor(a);
				})[0];
				buylist.push(workfac);
				ns.print("aiming to get " + targaug + " from " + workfac + "...");
				if (!sing.workForFaction(workfac, "hacking", focus)) { sing.workForFaction(workfac, "field", focus) }
				while (sing.getFactionRep(workfac) < sing.getAugmentationRepReq(targaug)) {
					if (sing.getFactionFavor(workfac) >= ns.getFavorToDonate()) {
						await wsing.donateToFactionD(workfac, Math.max(10000000, Math.trunc(ns.getServerMoneyAvailable("home") / 4)))
					}
					await ns.sleep(60000);
				}
				sing.stopAction();
			} else {
				buylist.push(augfacs.sort((a, b) => { return sing.getFactionRep(b) - sing.getFactionRep(a); })[0]);
			}
		} else {
			buylist.push(gangfac);
			ns.print("aiming to get " + targaug + " from " + gangfac + "...");
			while (sing.getFactionRep(gangfac) < sing.getAugmentationRepReq(targaug)) { await moneyTimeKill(ns, focus); }
		}
	}
	ns.scriptKill("h4ckrnet.js", "home");
	ns.scriptKill("babysitter.js", "home");
	ns.run("hashout.js");
	for (let i = 0; i < worklist.length; i++) {
		let targaug = worklist[i];
		let targfac = buylist[i];
		ns.print("buying " + targaug + " from " + targfac + "...");
		while (!(await wsing.purchaseAugmentationD(targfac, targaug))) { await moneyTimeKill(ns, focus); }
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
	while (sing.upgradeHomeRam()) { await ns.sleep(10); }
	while (sing.upgradeHomeCores()) { await ns.sleep(10); }
	while (await wsing.purchaseAugmentationD(factions[0], "NeuroFlux Governor")) { await ns.sleep(10); }
	if (ns.getResetInfo().currentNode == 2 && ns.gang.inGang()) { await wsing.purchaseAugmentationD(ns.gang.getGangInformation().faction, "The Red Pill"); }
	else { await wsing.purchaseAugmentationD("Daedalus", "The Red Pill"); }
	if ((await wsing.getOwnedAugmentationsD()).includes("The Red Pill") && (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel("w0r1d_d43m0n"))) {
		ns.tprint("GO BACKDOOR w0r1d_d43m0n");
	} else {
		await wsing.installAugmentationsD("patsy.js");
	}
}