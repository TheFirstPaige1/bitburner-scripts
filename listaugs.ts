import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	const factions = ns.getPlayer().factions;
	const playeraugs = ns.singularity.getOwnedAugmentations(true);
	let auglist = [] as Array<string>;
	for (const faction of factions) {
		const factaugs = ns.singularity.getAugmentationsFromFaction(faction);
		for (const targaug of factaugs) {
			if (!auglist.includes(targaug) && !playeraugs.includes(targaug)) {
				auglist.push(targaug);
			}
		}
	}
	ns.tprint(auglist.toString());
}