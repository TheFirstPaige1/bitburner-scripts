import { NS } from "@ns";
import { lowestCombatStat } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	const target = ns.args[0] as number;
	const focus = !ns.singularity.getOwnedAugmentations().includes("Neuroreceptor Management Implant");
	ns.singularity.goToLocation("Sector-12");
	let loweststat = lowestCombatStat(ns);
	while (loweststat[1] < target) {
		ns.singularity.gymWorkout("Powerhouse Gym", loweststat[0], focus);
		await ns.sleep(1000);
		loweststat = lowestCombatStat(ns);
	}
	ns.singularity.stopAction();
}