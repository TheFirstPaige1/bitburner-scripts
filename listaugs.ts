import { NS } from "@ns";
import { desiredfactions, hasDesiredStats } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	const combat = (ns.args[0] == true);
	const playeraugs = ns.singularity.getOwnedAugmentations(true);
	let auglist = [] as string[];
	for (const faction of desiredfactions) {
		const factaugs = ns.singularity.getAugmentationsFromFaction(faction);
		for (const targaug of factaugs) {
			if (!auglist.includes(targaug) && !playeraugs.includes(targaug)) {
				if (combat) { auglist.push(targaug); }
				else { if (hasDesiredStats(ns, targaug)) { auglist.push(targaug); } }
			}
		}
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
		sortedlist.push(...auglist.splice(highdex, 1));
	}
	if (ns.gang.inGang()) { sortedlist = sortedlist.filter(aug => !ns.singularity.getAugmentationsFromFaction(ns.gang.getGangInformation().faction).includes(aug)); }
	for (const aug of sortedlist) {
		ns.tprint(aug + ": "
			+ ns.formatNumber(ns.singularity.getAugmentationRepReq(aug)) + ", "
			+ ns.singularity.getAugmentationFactions(aug).toString());
	}
}