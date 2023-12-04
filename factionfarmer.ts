import { NS } from "@ns";
import { desiredfactions, factionHasAugs, getKarma, hasFocusPenalty, lowestCombatStat, moneyTimeKill, popTheHood, remoteConnect } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	const combat = (ns.args[0] == true);
	const focus = hasFocusPenalty(ns);
	ns.singularity.stopAction();
	const cityfactions = ["Sector-12", "Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven"];
	for (const faction of ns.singularity.checkFactionInvitations()) { if (!cityfactions.includes(faction)) { ns.singularity.joinFaction(faction); } }
	let fac = desiredfactions[0];	//Netburners
	if (factionHasAugs(ns, fac, combat) && !ns.getPlayer().factions.includes(fac)) {
		if (ns.hacknet.numNodes() < 1) { while (ns.hacknet.purchaseNode() == -1) { await moneyTimeKill(ns, focus); } }
		if (ns.hacknet.getNodeStats(0).level < 100) { while (!ns.hacknet.upgradeLevel(0, 99)) { await moneyTimeKill(ns, focus); } }
		if (ns.hacknet.getNodeStats(0).ram < 8) { while (!ns.hacknet.upgradeRam(0, 3)) { await moneyTimeKill(ns, focus); } }
		if (ns.hacknet.getNodeStats(0).cores < 4) { while (!ns.hacknet.upgradeCore(0, 3)) { await moneyTimeKill(ns, focus); } }
		while (!ns.singularity.checkFactionInvitations().includes(fac)) { await ns.sleep(500); }
		ns.singularity.joinFaction(fac);
	}
	fac = desiredfactions[1];	//Tian Di Hui
	if (factionHasAugs(ns, fac, combat) && !ns.getPlayer().factions.includes(fac)) {
		while (!ns.singularity.travelToCity("Chongqing")) { await moneyTimeKill(ns, focus); }
		while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
		ns.singularity.joinFaction(fac);
	}
	fac = desiredfactions[2];	//Sector-12 (city faction)
	if (factionHasAugs(ns, fac, combat) && !ns.getPlayer().factions.includes(fac)) {
		while (!ns.singularity.travelToCity("Aevum")) { await moneyTimeKill(ns, focus); }
		while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
		ns.singularity.joinFaction(fac);
	}
	fac = desiredfactions[3];	//Aevum (city faction)
	if (factionHasAugs(ns, fac, combat) && !ns.getPlayer().factions.includes(fac)) {
		while (!ns.singularity.travelToCity("Aevum")) { await moneyTimeKill(ns, focus); }
		while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
		ns.singularity.joinFaction(fac);
	}
	fac = desiredfactions[4];	//CyberSec
	if (factionHasAugs(ns, fac, combat) && !ns.getPlayer().factions.includes(fac)) {
		let serv = "CSEC";
		while (!popTheHood(ns, serv)) { await moneyTimeKill(ns, focus); }
		while (ns.getServerRequiredHackingLevel(serv) > ns.getHackingLevel()) { await moneyTimeKill(ns, focus); }
		if (!ns.getServer(serv).backdoorInstalled) {
			remoteConnect(ns, serv);
			await ns.singularity.installBackdoor();
			ns.singularity.connect("home");
		}
		while (!ns.singularity.checkFactionInvitations().includes(fac)) { await ns.sleep(500); }
		ns.singularity.joinFaction(fac);
	}
	fac = desiredfactions[5];	//NiteSec
	if (factionHasAugs(ns, fac, combat) && !ns.getPlayer().factions.includes(fac)) {
		let serv = "avmnite-02h";
		while (!popTheHood(ns, serv)) { await moneyTimeKill(ns, focus); }
		while (ns.getServerRequiredHackingLevel(serv) > ns.getHackingLevel()) { await moneyTimeKill(ns, focus); }
		if (!ns.getServer(serv).backdoorInstalled) {
			remoteConnect(ns, serv);
			await ns.singularity.installBackdoor();
			ns.singularity.connect("home");
		}
		while (!ns.singularity.checkFactionInvitations().includes(fac)) { await ns.sleep(500); }
		ns.singularity.joinFaction(fac);
	}
	fac = desiredfactions[6];	//Tetrads
	if (factionHasAugs(ns, fac, combat) && !ns.getPlayer().factions.includes(fac)) {
		let combatstats = lowestCombatStat(ns);
		while (!ns.singularity.travelToCity("Sector-12")) { await moneyTimeKill(ns, focus); }
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
		while (!ns.singularity.travelToCity("Chongqing")) { await moneyTimeKill(ns, focus); }
		while (!ns.singularity.checkFactionInvitations().includes(fac)) { await ns.sleep(500); }
		ns.singularity.joinFaction(fac);
	}
	//7, Bachman & Associates - handle companies in the work manager script
	fac = desiredfactions[8]; //Bitrunners
	if (factionHasAugs(ns, fac, combat) && !ns.getPlayer().factions.includes(fac)) {
		let serv = "run4theh111z";
		while (!popTheHood(ns, serv)) { await moneyTimeKill(ns, focus); }
		while (ns.getServerRequiredHackingLevel(serv) > ns.getHackingLevel()) { await moneyTimeKill(ns, focus); }
		if (!ns.getServer(serv).backdoorInstalled) {
			remoteConnect(ns, serv);
			await ns.singularity.installBackdoor();
			ns.singularity.connect("home");
		}
		while (!ns.singularity.checkFactionInvitations().includes(fac)) { await ns.sleep(500); }
		ns.singularity.joinFaction(fac);
	}
	ns.run("workmanager.js");
}