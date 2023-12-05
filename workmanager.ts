import { CompanyName, JobName, NS } from "@ns";
import { companyFactions, desiredfactions, hasFocusPenalty, moneyTimeKill } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	const focus = hasFocusPenalty(ns);
	ns.singularity.stopAction();
	const playeraugs = ns.singularity.getOwnedAugmentations(true);
	const itjob = "IT" as JobName;
	let playerjobs = ns.getPlayer().jobs
	let playerjob = "" as CompanyName;
	for (let i = 0; i < companyFactions.length; i++) { if (playerjobs[companyFactions[i]] == itjob) { playerjob = companyFactions[i]; } }
	if (playerjob == "Fulcrum Technologies" as CompanyName) { playerjob = "Fulcrum Secret Technologies" as CompanyName }
	let auglist = [] as string[];
	for (const faction of desiredfactions) {
		const factaugs = ns.singularity.getAugmentationsFromFaction(faction);
		for (const targaug of factaugs) { if (!auglist.includes(targaug) && !playeraugs.includes(targaug)) { auglist.push(targaug); } }
	}
	let sortedlist = [] as string[];
	while (auglist.length > 0) {
		let highdex = 0;
		let highrep = 0;
		for (let i = 0; i < auglist.length; i++) {
			if (ns.singularity.getAugmentationRepReq(auglist[i]) > highrep) {
				highrep = ns.singularity.getAugmentationRepReq(auglist[i]);
				highdex = i;
			}
		}
		sortedlist.unshift(...auglist.splice(highdex, 1));
	}
	if (ns.gang.inGang()) { sortedlist = sortedlist.filter(aug => !ns.singularity.getAugmentationsFromFaction(ns.gang.getGangInformation().faction).includes(aug)); }
	let queued = ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations(false).length;
	while ((sortedlist.length > 0) && (queued < 7)) {
		for (const fac of ns.singularity.checkFactionInvitations()) { ns.singularity.joinFaction(fac); }
		let incrementor = 0;
		let targaug = sortedlist[incrementor];
		let targrep = ns.singularity.getAugmentationRepReq(targaug);
		let augfacs = ns.singularity.getAugmentationFactions(targaug).filter(fac => (ns.getPlayer().factions.includes(fac)) || (fac as CompanyName == playerjob));
		let facfav = 0;
		let targfac = "";
		do {
			targaug = sortedlist[incrementor];
			targrep = ns.singularity.getAugmentationRepReq(targaug);
			augfacs = ns.singularity.getAugmentationFactions(targaug).filter(fac => (ns.getPlayer().factions.includes(fac)) || (fac as CompanyName == playerjob));
			facfav = 0;
			targfac = "";
			for (let i = 0; i < augfacs.length; i++) {
				if (ns.singularity.getFactionFavor(augfacs[i]) > facfav) {
					facfav = ns.singularity.getFactionFavor(augfacs[i]);
					targfac = augfacs[i];
				}
			}
			if (targfac.length == 0) { incrementor++; }
		} while (!(targfac.length > 0))
		if (targfac as CompanyName == playerjob) {
			if (playerjob == "Fulcrum Secret Technologies" as CompanyName) { ns.singularity.workForCompany("Fulcrum Technologies" as CompanyName, focus); }
			else { ns.singularity.workForCompany(playerjob, focus); }
			while (!ns.singularity.checkFactionInvitations().includes(targfac)) {
				ns.singularity.upgradeHomeRam();
				ns.singularity.upgradeHomeCores();
				await ns.sleep(3000);
			}
			ns.singularity.joinFaction(targfac);
			ns.singularity.stopAction();
		}
		if (facfav >= ns.getFavorToDonate()) {
			while (ns.singularity.getFactionRep(targfac) < targrep) { if (!ns.singularity.donateToFaction(targfac, 1000000000)) { await moneyTimeKill(ns, focus); } }
		} else {
			if (!ns.singularity.workForFaction(targfac, "hacking", focus)) { ns.singularity.workForFaction(targfac, "field", focus) }
			while (ns.singularity.getFactionRep(targfac) < targrep) { await ns.sleep(6000); }
		}
		ns.singularity.stopAction();
		while (!ns.singularity.purchaseAugmentation(targfac, targaug)) { await moneyTimeKill(ns, focus); }
		queued++;
		ns.singularity.stopAction();
		sortedlist.splice(incrementor, 1);
	}
	ns.run("auginstaller.js");
}