import { NS } from "@ns";
import {
	quietTheBabblingThrong, hasFocusPenalty, quitEveryJob, createWorklist, desiredfactions, getCompanyJob, factionHasAugs, crimeFactions,
	joinFirstCrime, hackFactions, joinFirstHackers, companyFactions, joinFirstCompany, cityFactions, joinCityFactions, secretFactions, joinFirstSecret,
	graduateCompany, moneyTimeKill
} from "./bitlib";
export async function main(ns: NS): Promise<void> {
	quietTheBabblingThrong(ns);
	const focus = hasFocusPenalty(ns);
	const sing = ns.singularity;
	if (focus) { ns.tail(); }
	const augqueue = 7 - (sing.getOwnedAugmentations(true).length - sing.getOwnedAugmentations(false).length);
	sing.stopAction();
	quitEveryJob(ns);
	let worklist = createWorklist(ns, augqueue);
	let iterator = 0;
	while (worklist.length < augqueue && iterator < desiredfactions.length && getCompanyJob(ns) == undefined) {
		let pokefac = desiredfactions[iterator];
		ns.print("poking " + pokefac + "...");
		if (factionHasAugs(ns, pokefac)) {
			if (crimeFactions.includes(pokefac)) { await joinFirstCrime(ns, focus); }
			if (hackFactions.includes(pokefac)) { await joinFirstHackers(ns, focus); }
			if (companyFactions.includes(pokefac) && getCompanyJob(ns) == undefined) { await joinFirstCompany(ns, focus); }
			if (cityFactions.includes(pokefac)) { await joinCityFactions(ns, focus); }
			if (secretFactions.includes(pokefac)) { await joinFirstSecret(ns, focus); }
			worklist = createWorklist(ns, augqueue);
		}
		iterator++;
	}
	sing.stopAction();
	for (const fac of sing.checkFactionInvitations()) { sing.joinFaction(fac); }
	worklist = createWorklist(ns, augqueue);
	if (getCompanyJob(ns) != undefined && worklist.length < augqueue) {
		await graduateCompany(ns, focus);
		for (const fac of sing.checkFactionInvitations()) { sing.joinFaction(fac); }
		worklist = createWorklist(ns, augqueue);
		quitEveryJob(ns);
	}
	sing.stopAction();
	for (const aug of worklist) {
		ns.tprint((worklist.length - worklist.indexOf(aug)) + ": " + aug + ", "
			+ ns.formatNumber(sing.getAugmentationRepReq(aug)) + ", "
			+ sing.getAugmentationFactions(aug).toString());
	}
	for (const targaug of worklist) {
		if (!sing.getAugmentationFactions(targaug).some(fac => sing.getFactionRep(fac) >= sing.getAugmentationRepReq(targaug))) {
			if (!ns.gang.inGang() || (ns.gang.inGang() && !sing.getAugmentationFactions(targaug).includes(ns.gang.getGangInformation().faction))) {
				let workfac = sing.getAugmentationFactions(targaug).filter(fac => ns.getPlayer().factions.includes(fac)).sort((a, b) => {
					return sing.getFactionFavor(b) - sing.getFactionFavor(a);
				})[0];
				ns.print("aiming to get " + targaug + " from " + workfac + "...");
				if (sing.getFactionFavor(workfac) >= ns.getFavorToDonate()) {
					while (sing.getFactionRep(workfac) < sing.getAugmentationRepReq(targaug)) {
						if (!sing.donateToFaction(workfac, 500000000)) {
							await moneyTimeKill(ns, focus);
						}
					}
				} else {
					if (!sing.workForFaction(workfac, "hacking", focus)) { sing.workForFaction(workfac, "field", focus) }
					while (sing.getFactionRep(workfac) < sing.getAugmentationRepReq(targaug)) { await ns.sleep(6000); }
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
	//ns.run("auginstaller.js");
}