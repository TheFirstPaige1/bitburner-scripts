import { NS } from "@ns";
import { hasFocusPenalty, lowestCombatStat } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	const target = ns.args[0] as number;
	const focus = hasFocusPenalty(ns);
	while (!ns.singularity.travelToCity("Sector-12")) { await ns.sleep(60000); }
	let loweststat = lowestCombatStat(ns);
	while (loweststat[1] < target) {
		ns.singularity.gymWorkout("Powerhouse Gym", loweststat[0], focus);
		await ns.sleep(1000);
		loweststat = lowestCombatStat(ns);
	}
	ns.singularity.stopAction();
}