import { NS } from "@ns";
import { companyFactions, desiredfactions, factionHasAugs, hasFocusPenalty, lowestCombatStat, moneyTimeKill, quietTheBabblingThrong, setupCrimeFaction, setupHackFaction } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	const focus = hasFocusPenalty(ns);
	quietTheBabblingThrong(ns);
	if (focus) { ns.tail(); }
	ns.singularity.stopAction();
	//const cityfactions = ["Sector-12", "Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven"];
	//for (const faction of ns.singularity.checkFactionInvitations()) { if (!cityfactions.includes(faction)) { ns.singularity.joinFaction(faction); } }
	let playerjob = companyFactions.find(fac => ns.getPlayer().jobs[fac] != undefined);
	while (playerjob != undefined) {
		ns.singularity.quitJob(playerjob);
		playerjob = companyFactions.find(fac => ns.getPlayer().jobs[fac] != undefined);
	}
	let citygroup = 0;
	if (!(factionHasAugs(ns, "Sector-12") || factionHasAugs(ns, "Aevum"))) { citygroup = 1; }
	if (citygroup == 1 && !(factionHasAugs(ns, "Chongqing") || factionHasAugs(ns, "New Tokyo") || factionHasAugs(ns, "Ishima"))) { citygroup = 2; }
	let companyjoin = false;
	let hackfocus = 0;
	if (!factionHasAugs(ns, desiredfactions[4])) { hackfocus = 1; }
	if (!factionHasAugs(ns, desiredfactions[5])) { hackfocus = 2; }
	if (!factionHasAugs(ns, desiredfactions[8])) { hackfocus = 3; }
	let joincount = 0;
	let fac = desiredfactions[0];	//Netburners
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		while (!ns.singularity.checkFactionInvitations().includes(fac)) {
			if (ns.hacknet.numNodes() < 1) { while (ns.hacknet.purchaseNode() == -1) { await moneyTimeKill(ns, focus); } }
			if (ns.hacknet.getNodeStats(0).level < 100) { while (!ns.hacknet.upgradeLevel(0, 1)) { await moneyTimeKill(ns, focus); } }
			if (ns.hacknet.getNodeStats(0).ram < 8) { while (!ns.hacknet.upgradeRam(0, 1)) { await moneyTimeKill(ns, focus); } }
			if (ns.hacknet.getNodeStats(0).cores < 4) { while (!ns.hacknet.upgradeCore(0, 1)) { await moneyTimeKill(ns, focus); } }
		}
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
		if (hackfocus == 0) {
			await setupHackFaction(ns, "CSEC", focus);
			while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
			if (ns.singularity.joinFaction(fac)) { joincount++; }
		}
	}
	fac = desiredfactions[5];	//NiteSec
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (hackfocus == 1) {
			await setupHackFaction(ns, "avmnite-02h", focus);
			while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
			if (ns.singularity.joinFaction(fac)) { joincount++; }
		}
	}
	fac = desiredfactions[6];	//Tetrads
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (lowestCombatStat(ns)[1] > 50 || joincount < 4) {
			await setupCrimeFaction(ns, 75, -18, focus);
			while (!ns.singularity.travelToCity("Chongqing")) { await moneyTimeKill(ns, focus); }
			while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
			if (ns.singularity.joinFaction(fac)) { joincount++; }
		}
	}
	fac = desiredfactions[7];	//Bachman & Associates
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (!companyjoin && ns.singularity.applyToCompany("Bachman & Associates", "IT")) { companyjoin = true; }
	}
	fac = desiredfactions[8]; //Bitrunners
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (hackfocus == 2) {
			await setupHackFaction(ns, "run4theh111z", focus);
			while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
			if (ns.singularity.joinFaction(fac)) { joincount++; }
		}
	}
	fac = desiredfactions[9];	//ECorp
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (!companyjoin && ns.singularity.applyToCompany("ECorp", "IT")) { companyjoin = true; }
	}
	fac = desiredfactions[10];	//Daedalus
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (ns.singularity.getOwnedAugmentations(false).length >= 30 + ns.getBitNodeMultipliers().DaedalusAugsRequirement) {
			if (joincount < 1) {
				while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
				if (ns.singularity.joinFaction(fac)) { joincount++; }
			}
		}
	}
	fac = desiredfactions[11];	//Fulcrum Secret Technologies
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if ((ns.getHackingLevel() > 1200) && !companyjoin) {
			await setupHackFaction(ns, "fulcrumassets", focus);
			ns.singularity.quitJob("Fulcrum Technologies");
			if (ns.singularity.applyToCompany("Fulcrum Technologies", "IT")) { companyjoin = true; }
		}
	}
	fac = desiredfactions[12];	//The Black Hand
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (hackfocus == 3) {
			await setupHackFaction(ns, "I.I.I.I", focus);
			while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
			if (ns.singularity.joinFaction(fac)) { joincount++; }
		}
	}
	fac = desiredfactions[13];	//The Dark Army
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (lowestCombatStat(ns)[1] > 250 || joincount < 4) {
			await setupCrimeFaction(ns, 300, -45, focus);
			while (!ns.singularity.travelToCity("Chongqing")) { await moneyTimeKill(ns, focus); }
			while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
			if (ns.singularity.joinFaction(fac)) { joincount++; }
		}
	}
	fac = desiredfactions[14];	//Clarke Incorporated
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (!companyjoin && ns.singularity.applyToCompany("Clarke Incorporated", "IT")) { companyjoin = true; }
	}
	fac = desiredfactions[15];	//OmniTek Incorporated
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (!companyjoin && ns.singularity.applyToCompany("OmniTek Incorporated", "IT")) { companyjoin = true; }
	}
	fac = desiredfactions[16];	//NWO
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (!companyjoin && ns.singularity.applyToCompany("NWO", "IT")) { companyjoin = true; }
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
		if (!companyjoin && ns.singularity.applyToCompany("Blade Industries", "IT")) { companyjoin = true; }
	}
	fac = desiredfactions[21];	//Illuminati
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (ns.singularity.getOwnedAugmentations(false).length >= 30) {
			if (lowestCombatStat(ns)[1] > 1000 || joincount < 1) {
				await setupCrimeFaction(ns, 1200, 0, focus);
				while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
				if (ns.singularity.joinFaction(fac)) { joincount++; }
			}
		}
	}
	fac = desiredfactions[22]; //Slum Snakes
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		await setupCrimeFaction(ns, 30, -9, focus);
		while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
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
		if (lowestCombatStat(ns)[1] > 250 || joincount < 4) {
			await setupCrimeFaction(ns, 300, -45, focus);
			while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
			if (ns.singularity.joinFaction(fac)) { joincount++; }
		}
	}
	fac = desiredfactions[25];	//The Syndicate
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (lowestCombatStat(ns)[1] > 170 || joincount < 4) {
			await setupCrimeFaction(ns, 200, -90, focus);
			while (!ns.singularity.travelToCity("Aevum")) { await moneyTimeKill(ns, focus); }
			while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
			if (ns.singularity.joinFaction(fac)) { joincount++; }
		}
	}
	//26, MegaCorp
	//27, KuaiGong International
	//28, Silhouette - treat as both company and crime
	//let mostcompfav = companyFactions.sort((a, b) => { return ns.singularity.getCompanyFavor(b) - ns.singularity.getCompanyFavor(a); })[0];
	fac = desiredfactions[29];	//The Covenant
	if (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)) {
		if (ns.singularity.getOwnedAugmentations(false).length >= 20) {
			if (lowestCombatStat(ns)[1] > 700 || joincount < 1) {
				await setupCrimeFaction(ns, 850, 0, focus);
				while (!ns.singularity.checkFactionInvitations().includes(fac)) { await moneyTimeKill(ns, focus); }
				if (ns.singularity.joinFaction(fac)) { joincount++; }
			}
		}
	}
	ns.singularity.upgradeHomeRam();
	ns.singularity.upgradeHomeCores();
	ns.run("workmanager.js");
}