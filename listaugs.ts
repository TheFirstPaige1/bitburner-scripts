import { NS } from "@ns";
import { Multipliers } from "@ns";
export async function main(ns: NS): Promise<void> {
	const combat = ns.args[0];
	const desiredstats: (keyof Multipliers)[] = ["charisma", "charisma_exp", "company_rep", "faction_rep", "hacking", "hacking_chance",
		"hacking_exp", "hacking_grow", "hacking_money", "hacking_speed", "hacknet_node_money"];
	const desiredaugs = ["CashRoot Starter Kit", "Neuroreceptor Management Implant", "The Red Pill"]; //"The Blade's Simulacrum", not needed for now
	const desiredfactions = ["Netburners", "Tian Di Hui", "Aevum", "Daedalus", "CyberSec", "NiteSec", "Tetrads", "Bachman & Associates", "BitRunners", "ECorp",
		"Fulcrum Secret Technologies", "Four Sigma", "The Black Hand", "The Dark Army", "Clarke Incorporated", "OmniTek Incorporated", "NWO", "Chongqing",
		"Blade Industries", "MegaCorp", "KuaiGong International", "Slum Snakes", "Speakers for the Dead", "The Syndicate", "The Covenant"];
	const playeraugs = ns.singularity.getOwnedAugmentations(true);
	const donatefav = ns.getFavorToDonate();
	let workfactions = desiredfactions.filter(fac => ns.singularity.getFactionFavor(fac) < donatefav);
	let factions = ns.getPlayer().factions;
	for (const fac of desiredfactions) { if (!factions.includes(fac)) { factions.push(fac); } }
	let auglist = [];
	for (const aug of desiredaugs) { if (!playeraugs.includes(aug)) { auglist.push(aug); } }
	for (const faction of factions) {
		const factaugs = ns.singularity.getAugmentationsFromFaction(faction);
		for (const targaug of factaugs) {
			if (!auglist.includes(targaug) && !playeraugs.includes(targaug)) {
				if (combat) { if (!auglist.includes(targaug)) { auglist.push(targaug); } }
				else {
					let augstats = ns.singularity.getAugmentationStats(targaug);
					for (const stat of desiredstats) { if (augstats[stat] > 1 && !auglist.includes(targaug)) { auglist.push(targaug); } }
				}
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