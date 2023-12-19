import { NS } from "@ns";
import { createWorklist, getCompanyJob, hasFocusPenalty, moneyTimeKill, quietTheBabblingThrong, quitEveryJob, wageSlavery } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	quietTheBabblingThrong(ns);
	const focus = hasFocusPenalty(ns);
	if (focus) { ns.tail(); }
	const augqueue = 7 - (ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations(false).length);
	ns.singularity.stopAction();
	quitEveryJob(ns);
	//faction invites gathering here
	//faction category join order:
	//misc
	//crime
	//hacking
	//company
	//city
	//secret
	for (const fac of ns.singularity.checkFactionInvitations()) { ns.singularity.joinFaction(fac); }
	const playerjob = getCompanyJob(ns);
	let worklist = createWorklist(ns, augqueue)
	if (worklist.length < Math.trunc(augqueue / 2)) {
		if (playerjob != undefined) {
			if (playerjob == "Fulcrum Technologies") {
				while (!ns.singularity.checkFactionInvitations().includes("Fulcrum Secret Technologies")) { await wageSlavery(ns, focus); }
				ns.singularity.joinFaction("Fulcrum Secret Technologies");
			} else {
				while (!ns.singularity.checkFactionInvitations().includes(playerjob as string)) { await wageSlavery(ns, focus); }
				ns.singularity.joinFaction(playerjob as string);
			}
			for (const fac of ns.singularity.checkFactionInvitations()) { ns.singularity.joinFaction(fac); }
			worklist = createWorklist(ns, augqueue)
		}
	}
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
				if (ns.singularity.getFactionFavor(workfac) >= ns.getFavorToDonate()) {
					while (ns.singularity.getFactionRep(workfac) < ns.singularity.getAugmentationRepReq(targaug)) {
						if (!ns.singularity.donateToFaction(workfac, 500000000)) {
							await moneyTimeKill(ns, focus);
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
		while (!ns.singularity.purchaseAugmentation(targfac, targaug)) { await moneyTimeKill(ns, focus); }
	}
	ns.run("auginstaller.js");
}