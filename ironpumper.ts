import { NS } from "@ns";
import { hasFocusPenalty, lowestCombatStat } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	const target = ns.args[0] as number;
	const focus = hasFocusPenalty(ns);
	while (!ns.singularity.travelToCity("Sector-12")) { await ns.sleep(60000); }
	let loweststat = lowestCombatStat(ns.getPlayer());
	while (loweststat.value < target) {
		ns.singularity.gymWorkout("Powerhouse Gym", loweststat.name, focus);
		await ns.sleep(1000);
		loweststat = lowestCombatStat(ns.getPlayer());
	}
	ns.singularity.stopAction();
}