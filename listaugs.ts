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
	auglist.sort((a, b) => { return ns.singularity.getAugmentationRepReq(b) - ns.singularity.getAugmentationRepReq(a); })
	if (ns.gang.inGang()) { auglist = auglist.filter(aug => !ns.singularity.getAugmentationsFromFaction(ns.gang.getGangInformation().faction).includes(aug)); }
	if (playerfacs) {
		auglist = auglist.filter(aug => ns.singularity.getAugmentationFactions(aug).some(fac => ns.getPlayer().factions.includes(fac)));
		auglist = auglist.filter(aug => ns.singularity.getAugmentationPrereq(aug).every(aug => playeraugs.includes(aug)))
	}
	for (const aug of auglist) {
		ns.tprint((auglist.length - auglist.indexOf(aug)) + ": " + aug + ", "
			+ ns.formatNumber(ns.singularity.getAugmentationRepReq(aug)) + ", "
			+ ns.singularity.getAugmentationFactions(aug).toString());
	}
}