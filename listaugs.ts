import { NS } from "@ns";
import { desiredfactions, wrapNS } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	const wns = wrapNS(ns);
	const playerfacs = (ns.args[0] == true);
	const playeraugs = await wns.singularity.getOwnedAugmentationsD(true);
	let auglist = [] as string[];
	for (const faction of desiredfactions) {
		const factaugs = await wns.singularity.getAugmentationsFromFactionD(faction);
		for (const targaug of factaugs) { if (!auglist.includes(targaug) && !playeraugs.includes(targaug)) { auglist.push(targaug); } }
	}
	auglist.sort((a, b) => { return ns.singularity.getAugmentationRepReq(b) - ns.singularity.getAugmentationRepReq(a); })
	if (ns.gang.inGang()) {
		auglist = auglist.filter(async aug =>
			!(await wns.singularity.getAugmentationsFromFactionD(ns.gang.getGangInformation().faction)).includes(aug));
	}
	if (playerfacs) {
		auglist = auglist.filter(async aug => (await wns.singularity.getAugmentationFactionsD(aug)).some(fac => ns.getPlayer().factions.includes(fac)));
		auglist = auglist.filter(async aug => (await wns.singularity.getAugmentationPrereqD(aug)).every(aug => playeraugs.includes(aug)))
	}
	for (const aug of auglist) {
		ns.tprint((auglist.length - auglist.indexOf(aug)) + ": " + aug + ", "
			+ ns.formatNumber(ns.singularity.getAugmentationRepReq(aug)) + ", "
			+ (await wns.singularity.getAugmentationFactionsD(aug)).toString());
	}
}