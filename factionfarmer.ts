import { NS } from "@ns";
import { hasFocusPenalty, lowestCombatStat } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	const focus = hasFocusPenalty(ns);
	ns.singularity.stopAction();
	let combatstats = lowestCombatStat(ns)[1];
	while (combatstats <= 75) {
		if (ns.singularity.getCrimeChance("Homicide") > 0.5) { await ns.sleep(ns.singularity.commitCrime("Homicide", focus)); }
		else { await ns.sleep(ns.singularity.commitCrime("Mug", focus)); }
		combatstats = lowestCombatStat(ns)[1];
	}
}