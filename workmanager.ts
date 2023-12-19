import { NS } from "@ns";
import * as BitLib from "./bitlib";
export async function main(ns: NS): Promise<void> {
	BitLib.quietTheBabblingThrong(ns);
	const focus = BitLib.hasFocusPenalty(ns);
	if (focus) { ns.tail(); }
	const augqueue = 7 - (ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations(false).length);
	ns.singularity.stopAction();
	BitLib.quitEveryJob(ns);
	for (const fac of ns.singularity.checkFactionInvitations()) { ns.singularity.joinFaction(fac); }
	let worklist = BitLib.createWorklist(ns, augqueue);
	let iterator = 0;
	while ((worklist.length < augqueue && iterator < BitLib.desiredfactions.length) || BitLib.getCompanyJob(ns) == undefined) {
		let pokefac = BitLib.desiredfactions[iterator];
		ns.print("poking " + pokefac + "...");
		if (BitLib.factionHasAugs(ns, pokefac)) {
			if (BitLib.crimeFactions.includes(pokefac)) { await BitLib.joinFirstCrime(ns, focus); }
			if (BitLib.hackFactions.includes(pokefac)) { await BitLib.joinFirstHackers(ns, focus); }
			if (BitLib.companyFactions.includes(pokefac) && BitLib.getCompanyJob(ns) == undefined) { await BitLib.joinFirstCompany(ns, focus); }
			if (BitLib.cityFactions.includes(pokefac)) { await BitLib.joinCityFactions(ns, focus); }
			if (BitLib.secretFactions.includes(pokefac)) { await BitLib.joinFirstSecret(ns, focus); }
			worklist = BitLib.createWorklist(ns, augqueue);
		}
		iterator++;
	}
	ns.singularity.stopAction();
	for (const fac of ns.singularity.checkFactionInvitations()) { ns.singularity.joinFaction(fac); }
	if (BitLib.getCompanyJob(ns) != undefined && worklist.length < augqueue) {
		await BitLib.graduateCompany(ns, focus);
		for (const fac of ns.singularity.checkFactionInvitations()) { ns.singularity.joinFaction(fac); }
		worklist = BitLib.createWorklist(ns, augqueue);
		BitLib.quitEveryJob(ns);
	}
	ns.singularity.stopAction();
	ns.scriptKill("domainexpansion.js", "home");
	ns.scriptKill("serverstager.js", "home");
	ns.scriptKill("h4ckrnet.js", "home");
	for (const aug of worklist) {
		ns.tprint((worklist.length - worklist.indexOf(aug)) + ": " + aug + ", "
			+ ns.formatNumber(ns.singularity.getAugmentationRepReq(aug)) + ", "
			+ ns.singularity.getAugmentationFactions(aug).toString());
	}
	for (const targaug of worklist) {
		if (!ns.singularity.getAugmentationFactions(targaug).some(fac => ns.singularity.getFactionRep(fac) >= ns.singularity.getAugmentationRepReq(targaug))) {
			if (!ns.gang.inGang() || (ns.gang.inGang() && !ns.singularity.getAugmentationFactions(targaug).includes(ns.gang.getGangInformation().faction))) {
				let workfac = ns.singularity.getAugmentationFactions(targaug).filter(fac => ns.getPlayer().factions.includes(fac)).sort((a, b) => {
					return ns.singularity.getFactionFavor(b) - ns.singularity.getFactionFavor(a);
				})[0];
				ns.print("aiming to get " + targaug + " from " + workfac + "...");
				if (ns.singularity.getFactionFavor(workfac) >= ns.getFavorToDonate()) {
					while (ns.singularity.getFactionRep(workfac) < ns.singularity.getAugmentationRepReq(targaug)) {
						if (!ns.singularity.donateToFaction(workfac, 500000000)) {
							await BitLib.moneyTimeKill(ns, focus);
						}
					}
				} else {
					if (!ns.singularity.workForFaction(workfac, "hacking", focus)) { ns.singularity.workForFaction(workfac, "field", focus) }
					while (ns.singularity.getFactionRep(workfac) < ns.singularity.getAugmentationRepReq(targaug)) { await ns.sleep(6000); }
				}
				ns.singularity.stopAction();
			}
		}
	}
	for (const targaug of worklist) {
		let targfac = ns.singularity.getAugmentationFactions(targaug).sort((a, b) => { return ns.singularity.getFactionRep(b) - ns.singularity.getFactionRep(a); })[0];
		ns.print("buying " + targaug + " from " + targfac + "...");
		while (!ns.singularity.purchaseAugmentation(targfac, targaug)) { await BitLib.moneyTimeKill(ns, focus); }
	}
	ns.run("auginstaller.js");
}