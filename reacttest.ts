import { NS } from '@ns';
import { getFactionEnemies, getFactionUnmetReqs, getReadySleeveNum, getRemainingFactions, getWaitingCount, wrapNS } from './bitlib';
export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	ns.tail();
	ns.clearLog();

	/*
	this section is pending major rewrites to accomodate sleeves
	TODO:
	- instead of joining factions one at a time, create a list of factions that need work
	- assign sleeves and/or player to suitable jobs; all companies but Fulcrum offer security work for sleeves
	- all sleeves and/or player not given a task will spend the time doing crime
	*/
	const waitingcount = await getWaitingCount(ns);
	const augqueue = Math.max(0, (7 - waitingcount));
	const playeraugs = await wrapNS(ns).singularity.getOwnedAugmentationsD(true);
	let faclist = await getRemainingFactions(ns);
	for (const faction of faclist) { faclist = faclist.filter(fac => !getFactionEnemies(faction).includes(fac)); }
	faclist = faclist.slice(0, await getReadySleeveNum(ns) + 1);
	let trackedaugs = [] as string[];
	let tasklist = [];
	let worklist = [] as [string, string][];
	for (const pokefac of faclist) {
		ns.print("poking " + pokefac + "...");
		if (!ns.getPlayer().factions.includes(pokefac)) { tasklist.push(...getFactionUnmetReqs(ns, pokefac)); }
		let facaugs = await wrapNS(ns).singularity.getAugmentationsFromFactionD(pokefac);
		for (const pokeaug of facaugs) {
			if (!trackedaugs.includes(pokeaug) && !playeraugs.includes(pokeaug)) {
				trackedaugs.push(pokeaug);
				worklist.push([pokeaug, pokefac]);
			}
		}
	}
	worklist.sort((a, b) => { return ns.singularity.getAugmentationRepReq(a[0]) - ns.singularity.getAugmentationRepReq(b[0]); });
	worklist = worklist.slice(0, augqueue);
	ns.print(tasklist);
	for (const aug of worklist.reverse()) {
		ns.print((worklist.length - worklist.indexOf(aug)) + ": " + aug[0] + ", "
			+ ns.formatNumber(ns.singularity.getAugmentationRepReq(aug[0])) + ", "
			+ aug[1]);
	}
}