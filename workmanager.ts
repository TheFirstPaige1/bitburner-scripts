import { NS } from "@ns";
import { desiredfactions, hasDesiredStats, hasFocusPenalty } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	const focus = hasFocusPenalty(ns);
	ns.singularity.stopAction();
	const combat = (ns.args[0] == true);
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
	if (ns.gang.inGang()) {
		sortedlist = sortedlist.filter(aug => !ns.singularity.getAugmentationsFromFaction(ns.gang.getGangInformation().faction).includes(aug));
		workfactions = workfactions.filter(fac => fac != ns.gang.getGangInformation().faction);
	}
	workfactions = workfactions.filter(fac => ns.singularity.getAugmentationsFromFaction(fac).some(aug => sortedlist.includes(aug)));
	workfactions = workfactions.filter(fac => ns.getPlayer().factions.includes(fac));
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
	while (workfactions.length > 0) {
		if (!ns.singularity.workForFaction(workfactions[0], "hacking", focus)) { ns.singularity.workForFaction(workfactions[0], "field", focus) }
		while (ns.singularity.getFactionRep(workfactions[0]) < workreps[0]) { await ns.sleep(60000); }
		ns.singularity.stopAction();
		let augstobuy = ns.singularity.getAugmentationsFromFaction(workfactions[0]);
		augstobuy = augstobuy.filter(aug => ns.singularity.getFactionRep(workfactions[0]) > ns.singularity.getAugmentationRepReq(aug));
		if (!combat) { augstobuy = augstobuy.filter(aug => hasDesiredStats(ns, aug)); }
		let sortedaugs = [];
		while (augstobuy.length > 0) {
			let highdex = 0;
			let highrep = 0;
			for (let i = 0; i < augstobuy.length; i++) {
				if (ns.singularity.getAugmentationRepReq(augstobuy[i]) > highrep) {
					highrep = ns.singularity.getAugmentationRepReq(augstobuy[i]);
					highdex = i;
				}
			}
			sortedaugs.push(...augstobuy.splice(highdex, 1));
		}
		for (const aug of sortedaugs) {
			while (!ns.singularity.purchaseAugmentation(workfactions[0], aug)) {
				if (ns.singularity.getCrimeChance("Homicide") > 0.5) { await ns.sleep(ns.singularity.commitCrime("Homicide", focus)); }
				else { await ns.sleep(ns.singularity.commitCrime("Mug", focus)); }
			}
			ns.singularity.stopAction();
		}
		workfactions.shift();
		workreps.shift();
	}
}