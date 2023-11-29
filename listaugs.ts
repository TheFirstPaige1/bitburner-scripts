import { NS } from "@ns";
import { Multipliers } from "@ns";
export async function main(ns: NS): Promise<void> {
	let gangs = false;
	if (ns.fileExists("sourcefiles.txt", "home")) {
		let bitnodes = JSON.parse(ns.read("sourcefiles.txt"));
		if (bitnodes[0] == 2 || bitnodes[2] > 0) { gangs = true; }
	}
	const combat = ns.args[0];
	const desiredstats: (keyof Multipliers)[] = ["charisma", "charisma_exp", "company_rep", "faction_rep", "hacking", "hacking_chance",
		"hacking_exp", "hacking_grow", "hacking_money", "hacking_speed", "hacknet_node_money"];
	const desiredaugs = ["CashRoot Starter Kit", "Neuroreceptor Management Implant", "The Red Pill"]; //"The Blade's Simulacrum", not needed for now
	const factions = ns.getPlayer().factions;
	const playeraugs = ns.singularity.getOwnedAugmentations(true);
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
	let sortedlist = [];
	while (auglist.length > 0) {
		let highdex = 0;
		let highrep = 0;
		for (let i = 0; i < auglist.length; i++) {
			if (ns.singularity.getAugmentationRepReq(auglist[i]) > highrep) {
				highrep = ns.singularity.getAugmentationRepReq(auglist[i]);
				highdex = i;
			}
		}
		sortedlist.push(auglist[highdex]);
		auglist.splice(highdex);
	}
	if (gangs && ns.gang.inGang()) {
		sortedlist = sortedlist.filter(aug => !ns.singularity.getAugmentationsFromFaction(ns.gang.getGangInformation().faction).includes(aug));
	}
	ns.tprint(sortedlist.toString());
	//TODO:
	//check against a list of factions ordered early -> late
	//work for each in turn until all augs are acquired
}