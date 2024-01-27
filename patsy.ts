import { NS } from "@ns";
import {
	hasFocusPenalty, quietTheBabblingThrong, moneyTimeKill, createWorklist, desiredfactions, factionHasAugs,
	masterLister, joinEveryInvitedFaction, checkFactionEnemies, joinThisFaction, wrapNS, getWaitingCount
} from "./bitlib";
export async function main(ns: NS): Promise<void> {

	const installcount = 7;

	//initial setup
	ns.killall("home", true); //this is here to ensure the script will re-run from the start properly if need be
	const wns = wrapNS(ns);
	const focus = await hasFocusPenalty(ns);
	if (focus) { ns.tail(); }
	const sing = ns.singularity;
	const wsing = wns.singularity;
	quietTheBabblingThrong(ns);

	//grab all the .lit files and company/special faction invites
	for (const serv of masterLister(ns)) { ns.scp(ns.ls(serv, ".lit"), "home", serv); }
	joinEveryInvitedFaction(ns);

	ns.run("totalhack.js"); //run server hacking manager
	ns.run("ganggang.js"); //run gang manager
	ns.run("clericalpool.js"); //run sleeve manager

	//do 5 minutes of computer science for some initial hacking levels
	sing.universityCourse("Rothman University", "Computer Science", focus);
	await ns.sleep(Math.max(1, (300000 - (Date.now() - ns.getResetInfo().lastAugReset))));

	const progs = ["BruteSSH.exe", "FTPCrack.exe"]; //array of hacking programs to manually create
	const dwprogs = ["relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"]; //list of hacking programs to purchase with TOR

	//start creating manually-created programs that don't yet exist
	for (const prog of progs) {
		if (!ns.fileExists(prog, "home")) {
			while (!(await wsing.createProgramD(prog, focus))) {
				sing.universityCourse("Rothman University", "Computer Science", focus);
				await ns.sleep(10000);
			}
			while (!ns.fileExists(prog, "home")) { await ns.sleep(10000); }
		}
	}

	ns.run("h4ckrnet.js"); //run hacknet manager

	//purchase TOR and start attempting to buy the rest of the hacking programs
	while (!sing.purchaseTor()) { await moneyTimeKill(ns, focus); }
	sing.stopAction();
	for (const dwprog of dwprogs) {
		if (!ns.fileExists(dwprog, "home")) {
			while (!sing.purchaseProgram(dwprog)) { await moneyTimeKill(ns, focus); }
		}
	}
	sing.stopAction();

	let npid = ns.run("nettrawler.js"); //run automated server backdoorer
	while (ns.isRunning(npid)) { await moneyTimeKill(ns, focus); } //wait for it to finish
	ns.run("serverstager.js", 1, Math.trunc(ns.getServerMaxRam("home") / 2)); //run server purchaser, limited to half of home's ram
	ns.run("stockwatcher.js"); //run automated stock trader

	/*
	this section is pending major rewrites to accomodate sleeves
	TODO:
	- instead of joining factions one at a time, create a list of factions that need work
	- assign sleeves and/or player to suitable jobs; all companies but Fulcrum offer security work for sleeves
	- all sleeves and/or player not given a task will spend the time doing crime
	*/
	const waitingcount = await getWaitingCount(ns); //number of uninstalled but purchased augments
	const augqueue = Math.max(0, (installcount - waitingcount)); //number of augments left to buy this loop

	//creates a worklist (list of augments to work towards buying) and joins more factions if the length is below the install limit
	if (augqueue > 0) {
		let worklist = await createWorklist(ns, augqueue);
		let iterator = 0;
		while (worklist.length < augqueue && iterator < desiredfactions.length) {
			let pokefac = desiredfactions[iterator];
			ns.print("poking " + pokefac + "...");
			if (await factionHasAugs(ns, pokefac) && checkFactionEnemies(ns, pokefac)) {
				await joinThisFaction(ns, pokefac, focus); //TODO: create a new function that instead returns unmet requirements
				worklist = await createWorklist(ns, augqueue);
			}
			iterator++;
		}
		sing.stopAction();
		joinEveryInvitedFaction(ns);
		worklist = await createWorklist(ns, augqueue);

		//print the worklist to the console, for transparency
		for (const aug of worklist) {
			ns.tprint((worklist.length - worklist.indexOf(aug)) + ": " + aug + ", "
				+ ns.formatNumber(sing.getAugmentationRepReq(aug)) + ", "
				+ (await wsing.getAugmentationFactionsD(aug)).toString());
		}

		ns.run("servershare.js"); //run the public server ram share script to increase faction rep gains

		//being in a gang changes how buying augments is handled for most augments, so we set up the needed info here
		let gangaugs = [] as string[];
		let gangfac = "";
		let buylist = [] as string[];
		if (ns.gang.inGang()) {
			gangfac = ns.gang.getGangInformation().faction
			gangaugs = await wsing.getAugmentationsFromFactionD(gangfac);
		}

		//iterate down the worklist, starting with the most expensive augment, and working to ensure each faction in turn had enough rep
		//between this and the faction code up above represents the bulk of the sleeve changes
		for (const targaug of worklist) {
			if (!gangaugs.includes(targaug)) { //if the targeted augment isn't available from your gang...
				let augfacs = await wsing.getAugmentationFactionsD(targaug);
				if (!augfacs.some(fac => sing.getFactionRep(fac) >= sing.getAugmentationRepReq(targaug))) { //...and none of the factions that offer it have enough rep
					let workfac = augfacs.filter(fac => ns.getPlayer().factions.includes(fac)).sort((a, b) => { //grab the one with the most favour
						return sing.getFactionFavor(b) - sing.getFactionFavor(a);
					})[0];
					buylist.push(workfac);
					ns.print("aiming to get " + targaug + " from " + workfac + "...");
					if (!sing.workForFaction(workfac, "hacking", focus)) { sing.workForFaction(workfac, "field", focus) } //and work your butt off
					while (sing.getFactionRep(workfac) < sing.getAugmentationRepReq(targaug)) {
						if (sing.getFactionFavor(workfac) >= ns.getFavorToDonate()) { //if we have enough favor to donate, do so periodically in the background
							await wsing.donateToFactionD(workfac, Math.max(10000000, Math.trunc(ns.getServerMoneyAvailable("home") / 4)))
						}
						await ns.sleep(60000);
					}
					sing.stopAction();
				} else { //...and one or more of them has enough rep, grab the one with the most rep
					buylist.push(augfacs.sort((a, b) => { return sing.getFactionRep(b) - sing.getFactionRep(a); })[0]);
				}
			} else { //if your gang offer it instead, just wait for them to be ready for you
				buylist.push(gangfac);
				ns.print("aiming to get " + targaug + " from " + gangfac + "...");
				while (sing.getFactionRep(gangfac) < sing.getAugmentationRepReq(targaug)) { await moneyTimeKill(ns, focus); }
			}
		}

		ns.scriptKill("h4ckrnet.js", "home"); //we want to stop the hacknet from expanding and eating money now
		ns.scriptKill("babysitter.js", "home"); //and dedicate hashes to one task
		ns.run("hashout.js"); //making fat stacks of cash

		//now we iterate down the length of our work + buy lists, buying the augment in the worklist from the faction in the buylist
		//this is a bit awkward but it allows gangs to work for this
		for (let i = 0; i < worklist.length; i++) {
			let targaug = worklist[i];
			let targfac = buylist[i];
			ns.print("buying " + targaug + " from " + targfac + "...");
			while (!(await wsing.purchaseAugmentationD(targfac, targaug))) { await moneyTimeKill(ns, focus); }
		}
	}

	//now that we have a list of augments awaiting installation, cleanup time
	joinEveryInvitedFaction(ns);
	ns.scriptKill("stockwatcher.js", "home"); //kill the stock trader now
	let spid = ns.run("bailwse.js"); //and run the liquidation script
	while (ns.isRunning(spid)) { await moneyTimeKill(ns, focus); } //wait until it finishes

	while (sing.upgradeHomeRam()) { await ns.sleep(10); } //buy as much home ram as we can afford
	while (sing.upgradeHomeCores()) { await ns.sleep(10); } //do the same with home cores

	//find the player faction with the most rep that sells NFGs and bulk buy as many as we can afford
	const excludedfacs = ["Bladeburners", "Church of the Machine God", "Shadows of Anarchy"];
	let factions = ns.getPlayer().factions;
	factions = factions.filter(fac => !excludedfacs.includes(fac));
	if (ns.gang.inGang()) { factions = factions.filter(fac => ns.gang.getGangInformation().faction != fac); }
	factions = factions.sort((a, b) => { return sing.getFactionRep(b) - sing.getFactionRep(a); })
	while (await wsing.purchaseAugmentationD(factions[0], "NeuroFlux Governor")) { await ns.sleep(10); }

	//Red Pill always costs 0, so if we happen to have the rep for it but it's unpurchased, we can squeeze it in now
	if (ns.getResetInfo().currentNode == 2 && ns.gang.inGang()) { await wsing.purchaseAugmentationD(ns.gang.getGangInformation().faction, "The Red Pill"); }
	else { await wsing.purchaseAugmentationD("Daedalus", "The Red Pill"); }

	//if we can finish the bitnode right now, don't bother installing, otherwise install and start over
	if ((await wsing.getOwnedAugmentationsD()).includes("The Red Pill") && (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel("w0r1d_d43m0n"))) {
		ns.tprint("GO BACKDOOR w0r1d_d43m0n");
	} else {
		await wsing.installAugmentationsD("patsy.js");
	}
}