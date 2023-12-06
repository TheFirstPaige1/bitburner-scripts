import { NS } from "@ns";
import { desiredfactions, factionHasAugs, hasFocusPenalty, lowestCombatStat, moneyTimeKill, setupCrimeFaction, setupHackFaction } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	const focus = hasFocusPenalty(ns);
	ns.singularity.stopAction();
	const cityfactions = ["Sector-12", "Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven"];
	for (const faction of ns.singularity.checkFactionInvitations()) { if (!cityfactions.includes(faction)) { ns.singularity.joinFaction(faction); } }
	let citygroup = 0;
	if (!(factionHasAugs(ns, "Sector-12") || factionHasAugs(ns, "Aevum"))) { citygroup = 1; }
	if (citygroup == 1 && !(factionHasAugs(ns, "Chongqing") || factionHasAugs(ns, "New Tokyo") || factionHasAugs(ns, "Ishima"))) { citygroup = 2; }
	let companyjoin = false;
	let joincount = 0;
	let fac = desiredfactions[0];	//Netburners
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		//there was hacknet stuff here, but setup has it now, so netburners will always invite
		while (!ns.singularity.checkFactionInvitations().includes(fac)) { await ns.sleep(500); }
		if (ns.singularity.joinFaction(fac)) { joincount++; }
	}
	fac = desiredfactions[1];	//Tian Di Hui
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		while (!ns.singularity.travelToCity("Chongqing")) { await moneyTimeKill(ns, focus); }
		while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
		if (ns.singularity.joinFaction(fac)) { joincount++; }
	}
	fac = desiredfactions[2];	//Sector-12 (city faction)
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (citygroup == 0) {
			while (!ns.singularity.travelToCity("Sector-12")) { await moneyTimeKill(ns, focus); }
			while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
			if (ns.singularity.joinFaction(fac)) { joincount++; }
		}
	}
	fac = desiredfactions[3];	//Aevum (city faction)
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (citygroup == 0) {
			while (!ns.singularity.travelToCity("Aevum")) { await moneyTimeKill(ns, focus); }
			while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
			if (ns.singularity.joinFaction(fac)) { joincount++; }
		}
	}
	fac = desiredfactions[4];	//CyberSec
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		await setupHackFaction(ns, "CSEC", focus);
		while (!ns.singularity.checkFactionInvitations().includes(fac)) { await ns.sleep(500); }
		if (ns.singularity.joinFaction(fac)) { joincount++; }
	}
	fac = desiredfactions[5];	//NiteSec
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		await setupHackFaction(ns, "avmnite-02h", focus);
		while (!ns.singularity.checkFactionInvitations().includes(fac)) { await ns.sleep(500); }
		if (ns.singularity.joinFaction(fac)) { joincount++; }
	}
	fac = desiredfactions[6];	//Tetrads
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (lowestCombatStat(ns)[1] > 30) {
			await setupCrimeFaction(ns, 75, -18, focus);
			while (!ns.singularity.travelToCity("Chongqing")) { await moneyTimeKill(ns, focus); }
			while (!ns.singularity.checkFactionInvitations().includes(fac)) { await ns.sleep(500); }
			if (ns.singularity.joinFaction(fac)) { joincount++; }
		}
	}
	fac = desiredfactions[7];	//Bachman & Associates
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (!companyjoin) {
			ns.singularity.quitJob("Bachman & Associates");
			while (!ns.singularity.applyToCompany("Bachman & Associates", "IT")) { await moneyTimeKill(ns, focus); }
			companyjoin = true;
		}
	}
	fac = desiredfactions[8]; //Bitrunners
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		await setupHackFaction(ns, "run4theh111z", focus);
		while (!ns.singularity.checkFactionInvitations().includes(fac)) { await ns.sleep(500); }
		if (ns.singularity.joinFaction(fac)) { joincount++; }
	}
	fac = desiredfactions[9];	//ECorp
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (!companyjoin) {
			ns.singularity.quitJob("ECorp");
			while (!ns.singularity.applyToCompany("ECorp", "IT")) { await moneyTimeKill(ns, focus); }
			companyjoin = true;
		}
	}
	//10, Daedalus
	fac = desiredfactions[11];	//Fulcrum Secret Technologies
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if ((ns.getHackingLevel() > 1200) && !companyjoin) {
			await setupHackFaction(ns, "fulcrumassets", focus);
			ns.singularity.quitJob("Fulcrum Technologies");
			while (!ns.singularity.applyToCompany("Fulcrum Technologies", "IT")) { await moneyTimeKill(ns, focus); }
			companyjoin = true;
		}
	}
	fac = desiredfactions[12];	//The Black Hand
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		await setupHackFaction(ns, "I.I.I.I", focus);
		while (!ns.singularity.checkFactionInvitations().includes(fac)) { await ns.sleep(500); }
		if (ns.singularity.joinFaction(fac)) { joincount++; }
	}
	fac = desiredfactions[13];	//The Dark Army
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (lowestCombatStat(ns)[1] > 250) {
			await setupCrimeFaction(ns, 300, -45, focus);
			while (!ns.singularity.travelToCity("Chongqing")) { await moneyTimeKill(ns, focus); }
			while (!ns.singularity.checkFactionInvitations().includes(fac)) { await ns.sleep(500); }
			if (ns.singularity.joinFaction(fac)) { joincount++; }
		}
	}
	fac = desiredfactions[14];	//Clarke Incorporated
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (!companyjoin) {
			ns.singularity.quitJob("Clarke Incorporated");
			while (!ns.singularity.applyToCompany("Clarke Incorporated", "IT")) { await moneyTimeKill(ns, focus); }
			companyjoin = true;
		}
	}
	fac = desiredfactions[15];	//OmniTek Incorporated
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (!companyjoin) {
			ns.singularity.quitJob("OmniTek Incorporated");
			while (!ns.singularity.applyToCompany("OmniTek Incorporated", "IT")) { await moneyTimeKill(ns, focus); }
			companyjoin = true;
		}
	}
	fac = desiredfactions[16];	//NWO
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (!companyjoin) {
			ns.singularity.quitJob("NWO");
			while (!ns.singularity.applyToCompany("NWO", "IT")) { await moneyTimeKill(ns, focus); }
			companyjoin = true;
		}
	}
	fac = desiredfactions[17]; //Chongqing (city faction)
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (citygroup == 1) {
			while (!ns.singularity.travelToCity("Chongqing")) { await moneyTimeKill(ns, focus); }
			while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
			if (ns.singularity.joinFaction(fac)) { joincount++; }
		}
	}
	fac = desiredfactions[18]; //New Tokyo (city faction)
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (citygroup == 1) {
			while (!ns.singularity.travelToCity("New Tokyo")) { await moneyTimeKill(ns, focus); }
			while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
			if (ns.singularity.joinFaction(fac)) { joincount++; }
		}
	}
	fac = desiredfactions[19]; //Ishima (city faction)
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (citygroup == 1) {
			while (!ns.singularity.travelToCity("Ishima")) { await moneyTimeKill(ns, focus); }
			while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
			if (ns.singularity.joinFaction(fac)) { joincount++; }
		}
	}
	fac = desiredfactions[20];	//Blade Industries
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (!companyjoin) {
			ns.singularity.quitJob("Blade Industries");
			while (!ns.singularity.applyToCompany("Blade Industries", "IT")) { await moneyTimeKill(ns, focus); }
			companyjoin = true;
		}
	}
	//21, Illuminati
	fac = desiredfactions[22]; //Slum Snakes
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		await setupCrimeFaction(ns, 30, -9, focus);
		while (!ns.singularity.checkFactionInvitations().includes(fac)) { await ns.sleep(500); }
		if (ns.singularity.joinFaction(fac)) { joincount++; }
	}
	fac = desiredfactions[23]; //Volhaven  (city faction)
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (citygroup == 2) {
			while (!ns.singularity.travelToCity("Volhaven")) { await moneyTimeKill(ns, focus); }
			while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
			if (ns.singularity.joinFaction(fac)) { joincount++; }
		}
	}
	fac = desiredfactions[24];	//Speakers for the Dead
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (lowestCombatStat(ns)[1] > 250) {
			await setupCrimeFaction(ns, 300, -45, focus);
			while (!ns.singularity.checkFactionInvitations().includes(fac)) { await ns.sleep(500); }
			if (ns.singularity.joinFaction(fac)) { joincount++; }
		}
	}
	fac = desiredfactions[25];	//The Syndicate
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (lowestCombatStat(ns)[1] > 150) {
			await setupCrimeFaction(ns, 200, -90, focus);
			while (!ns.singularity.travelToCity("Aevum")) { await moneyTimeKill(ns, focus); }
			while (!ns.singularity.checkFactionInvitations().includes(fac)) { await ns.sleep(500); }
			if (ns.singularity.joinFaction(fac)) { joincount++; }
		}
	}
	ns.run("workmanager.js");
}