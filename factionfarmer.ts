import { NS } from "@ns";
import { desiredfactions, factionHasAugs, getKarma, hasFocusPenalty, lowestCombatStat, popTheHood, remoteConnect } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	const combat = (ns.args[0] == true);
	const focus = hasFocusPenalty(ns);
	ns.singularity.stopAction();
	const cityfactions = ["Sector-12", "Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven"];
	for (const faction of ns.singularity.checkFactionInvitations()) { if (!cityfactions.includes(faction)) { ns.singularity.joinFaction(faction); } }
	//Netburners
	if (factionHasAugs(ns, desiredfactions[0], combat) && !ns.getPlayer().factions.includes(desiredfactions[0])) {
		if (ns.hacknet.numNodes() < 1) { while (ns.hacknet.purchaseNode() == -1) { await ns.sleep(60000); } }
		if (ns.hacknet.getNodeStats(0).level < 100) { while (ns.hacknet.upgradeLevel(0, 99)) { await ns.sleep(60000); } }
		if (ns.hacknet.getNodeStats(0).ram < 8) { while (ns.hacknet.upgradeRam(0, 3)) { await ns.sleep(60000); } }
		if (ns.hacknet.getNodeStats(0).cores < 4) { while (ns.hacknet.upgradeCore(0, 3)) { await ns.sleep(60000); } }
		while (!ns.singularity.checkFactionInvitations().includes(desiredfactions[0])) { await ns.sleep(500); }
		ns.singularity.joinFaction(desiredfactions[0]);
	}
	//Tian Di Hui
	if (factionHasAugs(ns, desiredfactions[1], combat) && !ns.getPlayer().factions.includes(desiredfactions[1])) {
		while (!ns.singularity.travelToCity("Chongqing")) { await ns.sleep(60000) }
		while (!ns.singularity.checkFactionInvitations().includes(desiredfactions[1])) { await ns.sleep(60000); }
		ns.singularity.joinFaction(desiredfactions[1]);
	}
	//Aevum (city faction)
	if (factionHasAugs(ns, desiredfactions[2], combat) && !ns.getPlayer().factions.includes(desiredfactions[2])) {
		while (!ns.singularity.travelToCity("Aevum")) { await ns.sleep(60000) }
		while (!ns.singularity.checkFactionInvitations().includes(desiredfactions[2])) { await ns.sleep(60000); }
		ns.singularity.joinFaction(desiredfactions[2]);
	}
	//CyberSec
	if (factionHasAugs(ns, desiredfactions[3], combat) && !ns.getPlayer().factions.includes(desiredfactions[3])) {
		while (!popTheHood(ns, "CSEC")) { await ns.sleep(60000); }
		while (ns.getServerRequiredHackingLevel("CSEC") > ns.getHackingLevel()) { await ns.sleep(60000); }
		if (!ns.getServer("CSEC").backdoorInstalled) {
			remoteConnect(ns, "CSEC");
			await ns.singularity.installBackdoor();
			ns.singularity.connect("home");
		}
		while (!ns.singularity.checkFactionInvitations().includes(desiredfactions[3])) { await ns.sleep(500); }
		ns.singularity.joinFaction(desiredfactions[3]);
	}
	//NiteSec
	if (factionHasAugs(ns, desiredfactions[4], combat) && !ns.getPlayer().factions.includes(desiredfactions[4])) {
		while (!popTheHood(ns, "avmnite-02h")) { await ns.sleep(60000); }
		while (ns.getServerRequiredHackingLevel("avmnite-02h") > ns.getHackingLevel()) { await ns.sleep(60000); }
		if (!ns.getServer("avmnite-02h").backdoorInstalled) {
			remoteConnect(ns, "avmnite-02h");
			await ns.singularity.installBackdoor();
			ns.singularity.connect("home");
		}
		while (!ns.singularity.checkFactionInvitations().includes(desiredfactions[4])) { await ns.sleep(500); }
		ns.singularity.joinFaction(desiredfactions[4]);
	}
	//Tetrads
	if (factionHasAugs(ns, desiredfactions[5], combat) && !ns.getPlayer().factions.includes(desiredfactions[5])) {
		let combatstats = lowestCombatStat(ns);
		while (!ns.singularity.travelToCity("Sector-12")) { await ns.sleep(60000); }
		while (combatstats[1] < 75) {
			ns.singularity.gymWorkout("Powerhouse Gym", combatstats[0], focus);
			await ns.sleep(1000);
			combatstats = lowestCombatStat(ns);
		}
		ns.singularity.stopAction();
		let currentkarma = getKarma(ns);
		while (currentkarma > -18) {
			if (ns.singularity.getCrimeChance("Homicide") > 0.5) { await ns.sleep(ns.singularity.commitCrime("Homicide", focus)); }
			else { await ns.sleep(ns.singularity.commitCrime("Mug", focus)); }
		}
		ns.singularity.stopAction();
		while (!ns.singularity.travelToCity("Chongqing")) { await ns.sleep(60000) }
		while (!ns.singularity.checkFactionInvitations().includes(desiredfactions[5])) { await ns.sleep(500); }
		ns.singularity.joinFaction(desiredfactions[5]);
	}
}