import { NS } from "@ns";
import { desiredfactions } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	const playerfacs = (ns.args[0] == true);
	const playeraugs = ns.singularity.getOwnedAugmentations(true);
	let auglist = [] as string[];
	for (const faction of desiredfactions) {
		const factaugs = ns.singularity.getAugmentationsFromFaction(faction);
		for (const targaug of factaugs) { if (!auglist.includes(targaug) && !playeraugs.includes(targaug)) { auglist.push(targaug); } }
	}
	let sortedlist = auglist.sort((a, b) => { return ns.singularity.getAugmentationRepReq(b) - ns.singularity.getAugmentationRepReq(a); })
	if (ns.gang.inGang()) { sortedlist = sortedlist.filter(aug => !ns.singularity.getAugmentationsFromFaction(ns.gang.getGangInformation().faction).includes(aug)); }
	if (playerfacs) { sortedlist = sortedlist.filter(aug => ns.singularity.getAugmentationFactions(aug).some(fac => ns.getPlayer().factions.includes(fac))); }
	for (const aug of sortedlist) {
		ns.tprint(aug + ": "
			+ ns.formatNumber(ns.singularity.getAugmentationRepReq(aug)) + ", "
			+ ns.singularity.getAugmentationFactions(aug).toString());
	}
}