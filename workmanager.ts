import { NS } from "@ns";
import { companyFactions, desiredfactions, hasFocusPenalty, moneyTimeKill } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('sleep');
	const focus = hasFocusPenalty(ns);
	if (focus) { ns.tail(); }
	const augqueue = 7;
	const playerjob = companyFactions.find(fac => ns.getPlayer().jobs[fac] != undefined);
	ns.singularity.stopAction();
	for (const fac of ns.singularity.checkFactionInvitations()) { ns.singularity.joinFaction(fac); }
	const playeraugs = ns.singularity.getOwnedAugmentations(true);
	let auglist = [] as string[];
	for (const faction of desiredfactions) {
		const factaugs = ns.singularity.getAugmentationsFromFaction(faction);
		for (const targaug of factaugs) { if (!auglist.includes(targaug) && !playeraugs.includes(targaug)) { auglist.push(targaug); } }
	}
	let sortedlist = auglist.sort((a, b) => { return ns.singularity.getAugmentationRepReq(b) - ns.singularity.getAugmentationRepReq(a); })
	let worklist = sortedlist.filter(aug => ns.singularity.getAugmentationPrereq(aug).every(aug => playeraugs.includes(aug)))
	worklist = worklist.filter(aug => ns.singularity.getAugmentationFactions(aug).some(fac => ns.getPlayer().factions.includes(fac))).slice(-1 * augqueue);
	worklist = worklist.sort((a, b) => { return ns.singularity.getAugmentationPrice(b) - ns.singularity.getAugmentationPrice(a); })
	if (worklist.length < 5) {
		if (playerjob != undefined) {
			ns.singularity.workForCompany(playerjob, focus);
			if (playerjob == "Fulcrum Technologies") {
				while (!ns.singularity.checkFactionInvitations().includes("Fulcrum Secret Technologies")) {
					ns.singularity.applyToCompany(playerjob, "IT");
					await ns.sleep(6000);
				}
				ns.singularity.joinFaction("Fulcrum Secret Technologies");
			} else {
				while (!ns.singularity.checkFactionInvitations().includes(playerjob as string)) {
					ns.singularity.applyToCompany(playerjob, "IT");
					await ns.sleep(6000);
				}
				ns.singularity.joinFaction(playerjob as string);
			}
		}
	}
	ns.scriptKill("domainexpansion.js", "home");
	for (const targaug of worklist) {
		if (!ns.singularity.getAugmentationFactions(targaug).some(fac => ns.singularity.getFactionRep(fac) >= ns.singularity.getAugmentationRepReq(targaug))) {
			if (!ns.gang.inGang() || (ns.gang.inGang() && !ns.singularity.getAugmentationFactions(targaug).includes(ns.gang.getGangInformation().faction))) {
				let workfac = ns.singularity.getAugmentationFactions(targaug).filter(fac => ns.getPlayer().factions.includes(fac)).sort((a, b) => {
					return ns.singularity.getFactionFavor(b) - ns.singularity.getFactionFavor(a);
				});
				if (ns.singularity.getFactionFavor(workfac[0]) >= ns.getFavorToDonate()) {
					while (ns.singularity.getFactionRep(workfac[0]) < ns.singularity.getAugmentationRepReq(targaug)) {
						if (!ns.singularity.donateToFaction(workfac[0], 500000000)) {
							await moneyTimeKill(ns, focus, playerjob);
						}
					}
				} else {
					if (!ns.singularity.workForFaction(workfac[0], "hacking", focus)) { ns.singularity.workForFaction(workfac[0], "field", focus) }
					while (ns.singularity.getFactionRep(workfac[0]) < ns.singularity.getAugmentationRepReq(targaug)) { await ns.sleep(6000); }
				}
				ns.singularity.stopAction();
			}
		}
	}
	for (const targaug of worklist) {
		let targfac = ns.singularity.getAugmentationFactions(targaug).sort((a, b) => { return ns.singularity.getFactionRep(b) - ns.singularity.getFactionRep(a); })[0];
		while (!ns.singularity.purchaseAugmentation(targfac, targaug)) { await moneyTimeKill(ns, focus, playerjob); }
	}
	ns.run("auginstaller.js");
}