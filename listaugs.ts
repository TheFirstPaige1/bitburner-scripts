import { NS } from "@ns";
import { Multipliers } from "@ns";
export async function main(ns: NS): Promise<void> {
	const desiredstats: (keyof Multipliers)[] = ["charisma", "charisma_exp", "company_rep", "faction_rep", "hacking", "hacking_chance",
		"hacking_exp", "hacking_grow", "hacking_money", "hacking_speed", "hacknet_node_money"];
	const desiredaugs = ["CashRoot Starter Kit", "Neuroreceptor Management Implant", "The Blade's Simulacrum", "The Red Pill"];
	const factions = ns.getPlayer().factions;
	const playeraugs = ns.singularity.getOwnedAugmentations(true);
	let auglist = [] as Array<string>;
	for (const aug of desiredaugs) { if (!playeraugs.includes(aug)) { auglist.push(aug); } }
	for (const faction of factions) {
		const factaugs = ns.singularity.getAugmentationsFromFaction(faction);
		for (const targaug of factaugs) {
			if (!auglist.includes(targaug) && !playeraugs.includes(targaug)) {
				let addedyet = false;
				for (const stat of desiredstats) {
					const augstats = ns.singularity.getAugmentationStats(targaug);
					if (augstats[stat] > 1 && !addedyet) {
						auglist.push(targaug);
						addedyet = true;
					}
				}
			}
		}
	}
	ns.tprint(auglist.toString());
}