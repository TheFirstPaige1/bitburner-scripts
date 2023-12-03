import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	const target = ns.args[0] as number;
	const focus = !ns.singularity.getOwnedAugmentations().includes("Neuroreceptor Management Implant");
	ns.singularity.goToLocation("Sector-12");
	while (ns.getPlayer().skills.strength < target) {
		ns.singularity.gymWorkout("Powerhouse Gym", "strength", focus);
		await ns.sleep(1000);
	}
	while (ns.getPlayer().skills.defense < target) {
		ns.singularity.gymWorkout("Powerhouse Gym", "defense", focus);
		await ns.sleep(1000);
	}
	while (ns.getPlayer().skills.dexterity < target) {
		ns.singularity.gymWorkout("Powerhouse Gym", "dexterity", focus);
		await ns.sleep(1000);
	}
	while (ns.getPlayer().skills.agility < target) {
		ns.singularity.gymWorkout("Powerhouse Gym", "agility", focus);
		await ns.sleep(1000);
	}
	ns.singularity.stopAction();
}