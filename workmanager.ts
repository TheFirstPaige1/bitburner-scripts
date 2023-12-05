import { NS } from "@ns";
import { desiredfactions, hasFocusPenalty, moneyTimeKill } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	const focus = hasFocusPenalty(ns);
	ns.singularity.stopAction();
	const playeraugs = ns.singularity.getOwnedAugmentations(true);
	let auglist = [] as string[];
	for (const faction of desiredfactions) {
		const factaugs = ns.singularity.getAugmentationsFromFaction(faction);
		for (const targaug of factaugs) { if (!auglist.includes(targaug) && !playeraugs.includes(targaug)) { auglist.push(targaug); } }
	}
	let sortedlist = [] as string[];
	while (auglist.length > 0) {
		let highdex = 0;
		let highrep = 0;
		for (let i = 0; i < auglist.length; i++) {
			if (ns.singularity.getAugmentationRepReq(auglist[i]) > highrep) {
				highrep = ns.singularity.getAugmentationRepReq(auglist[i]);
				highdex = i;
			}
		}
		sortedlist.unshift(...auglist.splice(highdex, 1));
	}
	if (ns.gang.inGang()) { sortedlist = sortedlist.filter(aug => !ns.singularity.getAugmentationsFromFaction(ns.gang.getGangInformation().faction).includes(aug)); }
	while (sortedlist.length > 0) {
		let targaug = sortedlist[0];
		let targrep = ns.singularity.getAugmentationRepReq(targaug);
		let augfacs = ns.singularity.getAugmentationFactions(targaug).filter(fac => ns.getPlayer().factions.includes(fac));
		let facfav = 0;
		let targfac = "";
		for (let i = 0; i < augfacs.length; i++) {
			if (ns.singularity.getFactionFavor(augfacs[i]) > facfav) {
				facfav = ns.singularity.getFactionFavor(augfacs[i]);
				targfac = augfacs[i];
			}
		}
		if (targfac.length > 0) {
			if (!ns.singularity.workForFaction(targfac, "hacking", focus)) { ns.singularity.workForFaction(targfac, "field", focus) }
			while (ns.singularity.getFactionRep(targfac) < targrep) { await ns.sleep(60000); }
			ns.singularity.stopAction();
			while (!ns.singularity.purchaseAugmentation(targfac, targaug)) { await moneyTimeKill(ns, focus); }
			ns.singularity.stopAction();
		}
		sortedlist.shift();
	}
}