import { NS } from "@ns";
import { augLister, wrapNS } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	const wns = wrapNS(ns);
	//const playerfacs = (ns.args[0] == true);
	const playeraugs = await wns.singularity.getOwnedAugmentationsD(true);
	let auglist = (await augLister(ns)).filter(targaug => !playeraugs.includes(targaug)).reverse();
	if (ns.gang.inGang()) {
		const gangAugs = await wns.singularity.getAugmentationsFromFactionD(ns.gang.getGangInformation().faction);
		auglist = auglist.filter(aug => !gangAugs.includes(aug));
	}
	/*
	if (playerfacs) {
		auglist = auglist.filter(async aug => (await wns.singularity.getAugmentationFactionsD(aug)).some(fac => ns.getPlayer().factions.includes(fac)));
		auglist = auglist.filter(async aug => (await wns.singularity.getAugmentationPrereqD(aug)).every(aug => playeraugs.includes(aug)))
	}
	*/
	for (const aug of auglist) {
		ns.tprint((auglist.length - auglist.indexOf(aug)) + ": " + aug + ", "
			+ ns.formatNumber(ns.singularity.getAugmentationRepReq(aug)) + ", "
			+ (await wns.singularity.getAugmentationFactionsD(aug)).toString());
	}
}