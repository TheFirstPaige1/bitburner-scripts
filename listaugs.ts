import { NS } from "@ns";
import { hasDesiredStats } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	const combat = (ns.args[0] == true);
	const desiredfactions = ["Netburners", "Tian Di Hui", "Aevum", "Daedalus", "CyberSec", "NiteSec", "Tetrads", "Bachman & Associates", "BitRunners", "ECorp",
		"Fulcrum Secret Technologies", "Four Sigma", "The Black Hand", "The Dark Army", "Clarke Incorporated", "OmniTek Incorporated", "NWO", "Chongqing",
		"Blade Industries", "MegaCorp", "KuaiGong International", "Slum Snakes", "Speakers for the Dead", "The Syndicate", "The Covenant", "Illuminati"];
	const playeraugs = ns.singularity.getOwnedAugmentations(true);
	const donatefav = ns.getFavorToDonate();
	let workfactions = desiredfactions.filter(fac => ns.singularity.getFactionFavor(fac) < donatefav);
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
	for (const aug of sortedlist) { ns.tprint(aug + ": " + ns.singularity.getAugmentationFactions(aug).toString()); }
	workfactions = workfactions.filter(fac => ns.singularity.getAugmentationsFromFaction(fac).some(aug => sortedlist.includes(aug)));
	let workreps = [];
	for (const faction of workfactions) {
		let highestrep = 0;
		let facaugs = ns.singularity.getAugmentationsFromFaction(faction);
		for (const aug of facaugs) {
			let augrep = ns.singularity.getAugmentationRepReq(aug);
			if (augrep > highestrep && sortedlist.includes(aug)) { highestrep = augrep; }
		}
		let donaterep = ns.formulas.reputation.calculateFavorToRep(donatefav);
		workreps.push(Math.min(highestrep, donaterep));
	}
	//ns.singularity.workForFaction(workfactions[0], "hacking", false);
	//TODO:
	//work for each in turn until all augs are acquired
}