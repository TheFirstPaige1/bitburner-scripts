import { NS } from "@ns";
import { getReadySleeveNum, getStabbin, hasFocusPenalty, isSleeveReady, lowestCombatStat } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	const target = ns.args[0] as number;
	const sleevecount = await getReadySleeveNum(ns);
	const focus = await hasFocusPenalty(ns);
	while (!ns.singularity.travelToCity("Sector-12")) { await ns.sleep(1000); }
	for (let i = 0; i < sleevecount; i++) {
		if (await isSleeveReady(ns, i)) {
			while (!ns.sleeve.travel(i, "Sector-12")) {
				await ns.sleep(1000);
			}
		}
	}
	let loweststat = lowestCombatStat(ns.getPlayer());
	while (loweststat.value < target) {
		ns.singularity.gymWorkout("Powerhouse Gym", loweststat.name, focus);
		for (let i = 0; i < sleevecount; i++) {
			if (await isSleeveReady(ns, i)) {
				let sleevestatlow = lowestCombatStat(ns.sleeve.getSleeve(i));
				ns.sleeve.setToGymWorkout(i, "Powerhouse Gym", sleevestatlow.name);
			}
		}
		await ns.sleep(1000);
		loweststat = lowestCombatStat(ns.getPlayer());
	}
	ns.singularity.stopAction();
	for (let i = 0; i < sleevecount; i++) {
		if (await isSleeveReady(ns, i)) {
			ns.sleeve.setToCommitCrime(i, getStabbin(ns, ns.sleeve.getSleeve(i)));
		}
	}
}