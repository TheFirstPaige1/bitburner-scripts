import { CityName, CompanyName, NS, Player, SleevePerson } from "@ns";

/**
 * A hardcoded list of most of the normal factions in the game, ordered in a rough descending list of work priority. 
 */
export const desiredfactions = [
	"Netburners", //0, hacknet upgrades, cheap and usually helpful
	"Tian Di Hui", //1, focus penalty removal aug is considered high priority
	"Sector-12", //2, cashroot kit is early and useful
	"Aevum", //3, pcmatrix is a very good aug to have
	"CyberSec", //4, quick, low level, useful hack augs, has neurotrainer 1
	"NiteSec", //5, a natural followup to cybersec, similar kinds of augs, has two very useful unique augs
	"Tetrads", //6, a little out of the way, but by far the easiest source of a nice all skills aug
	"Bachman & Associates", //7, a very strong source of charisma and rep augs
	"BitRunners", //8, can skip the black hand until later, powerful unique augs
	"ECorp", //9, strong rep and hack augs
	"Daedalus", //10, working towards The Red Pill is the penultimate goal of a bitnode
	"Fulcrum Secret Technologies", //11, 
	//"Four Sigma", - no unique augs, no point bothering tbh
	"The Black Hand", //12, while ostensibly the third hack faction, only the unique aug is left between nitesec and bitrunners
	"The Dark Army", //it's about here I have up on the idea of prioritising factions, so below here is largely unsorted
	"Clarke Incorporated",
	"OmniTek Incorporated",
	"NWO",
	"Chongqing",
	"New Tokyo",
	"Ishima",
	"Blade Industries",
	"Illuminati",
	"Slum Snakes",
	"Volhaven",
	"Speakers for the Dead",
	"The Syndicate",
	"MegaCorp",
	"KuaiGong International",
	"Silhouette",
	"The Covenant"
];

export function quietTheBabblingThrong(ns: NS): void {
	ns.disableLog('disableLog');
	ns.disableLog('sleep');
	ns.disableLog('getServerMoneyAvailable');
	ns.disableLog('getHackingLevel');
	ns.disableLog('singularity.commitCrime');
	ns.disableLog('singularity.gymWorkout');
	ns.disableLog('singularity.applyToCompany');
	ns.disableLog('singularity.workForCompany');
}

/**
 * Creates an array detailing the server network, in the form of string pairs. 
 * The first of a pair is the name of a server, the second is the name of the server that is one step closer to home.
 * RAM cost: 4.25 GB
 * @param ns BitBurner NS object
 * @returns an array containing server name string pair arrays
 */
export function netScan(ns: NS): string[][] {
	/*let excludedservers = ns.getPurchasedServers();
	for (let i = 0; i < ns.hacknet.numNodes(); i++) { excludedservers.push(ns.hacknet.getNodeStats(i).name); }
	excludedservers.push("w0r1d_d43m0n");
	excludedservers.push("darkweb");*/
	let currentserver = "home";
	let scanservers = ["home"];
	let knownservers = [] as string[];
	let servermap = [["home", "home"]];
	while (scanservers.length > 0) {
		currentserver = scanservers[0];
		knownservers.push(currentserver);
		for (const scantarg of ns.scan(currentserver)) {
			if (!scanservers.includes(scantarg) && !knownservers.includes(scantarg)/* && !excludedservers.includes(scantarg)*/) {
				scanservers.push(scantarg);
				servermap.push([scantarg, currentserver]);
			}
		}
		scanservers = scanservers.slice(1);
	}
	return servermap;
}

/**
 * Attempts to open every port and nuke the given server, returning a boolean of root access.
 * RAM cost: 0.35 GB
 * @param ns BitBurner NS object
 * @param target string of the server to attempt to root
 * @returns true if root access was gained or already exists, false otherwise
 */
export function popTheHood(ns: NS, target: string): boolean {
	for (const fn of [ns.brutessh, ns.ftpcrack, ns.relaysmtp, ns.httpworm, ns.sqlinject, ns.nuke]) try { fn(target) } catch { }
	return (ns.hasRootAccess(target));
}

/**
 * Attempts to connect to a given server by daisy-chaining between it and home.
 * RAM cost: 36.25/12.25/6.25 GB
 * @param ns BitBurner NS object
 * @param target string of the server to connect to
 */
export function remoteConnect(ns: NS, target: string) {
	const networkmap = netScan(ns);
	let next = target;
	let netpath = [target];
	for (let i = networkmap.length - 1; i > 0; i--) {
		if (networkmap[i][0] == next) {
			next = networkmap[i][1];
			netpath.unshift(networkmap[i][1]);
		}
	}
	for (const next of netpath) { ns.singularity.connect(next); }
}

/**
 * Creates an array of strings of names of all the servers with current or possible root access.
 * RAM cost: 0.55 GB
 * @param ns BitBurner NS object
 * @returns an array of all root-accessable server name strings
 */
export function masterLister(ns: NS): string[] {
	let masterlist = ["home"];
	for (const scantarg of masterlist) {
		let workinglist = ns.scan(scantarg);
		for (const target of workinglist) {
			if (!masterlist.includes(target)) {
				if (popTheHood(ns, target)) { masterlist.push(target); }
			}
		}
	}
	return masterlist;
}

/**
 * Returns an array of the string and level of the lowest of the player's combat stats.
 * RAM cost: 0 GB
 * @param ns BitBurner NS object
 * @returns an array of the string and number of the lowest combat stat
 */
export function lowestCombatStat(ns: NS, target: Player | SleevePerson): [string, number] {
	const strength = ["strength", target.skills.strength] as [string, number];
	const defense = ["defense", target.skills.defense] as [string, number];
	const dexterity = ["dexterity", target.skills.dexterity] as [string, number];
	const agility = ["agility", target.skills.agility] as [string, number];
	let loweststat = strength;
	if (defense[1] < loweststat[1]) { loweststat = defense; }
	if (dexterity[1] < loweststat[1]) { loweststat = dexterity; }
	if (agility[1] < loweststat[1]) { loweststat = agility; }
	return loweststat;
}

/**
 * Evals an undocumented function call to grab a secret value, the player's current karma.
 * RAM cost: 0 GB
 * @param ns BitBurner NS object
 * @returns number of current karma, usually negative
 */
export function getKarma(ns: NS): number {
	return eval("ns.heart.break()");
}

/**
 * Checks for the Neuroreceptor Management Implant, and returns true if lacking the aug, to avoid unfocused work penalties.
 * RAM cost: 80/20/5 GB
 * @param ns BitBurner NS object
 * @returns returns true if the unfocused work penalty applies, false otherwise
 */
export function hasFocusPenalty(ns: NS): boolean {
	return !ns.singularity.getOwnedAugmentations().includes("Neuroreceptor Management Implant");
}

/**
 * Checks if a given faction still has unowned augments to buy. 
 * RAM cost: 243/63/18 GB
 * @param ns BitBurner NS object
 * @param faction string of a faction name to check for augments
 * @returns true if faction still has desired to get, false otherwise
 */
export function factionHasAugs(ns: NS, faction: string): boolean {
	let factionaugs = ns.singularity.getAugmentationsFromFaction(faction);
	factionaugs = factionaugs.filter(aug => !ns.singularity.getOwnedAugmentations(true).includes(aug));
	if (ns.gang.inGang() && ns.gang.getGangInformation().faction != faction) {
		factionaugs = factionaugs.filter(aug => ns.singularity.getAugmentationsFromFaction(ns.gang.getGangInformation().faction).includes(aug));
	}
	return (factionaugs.length > 0);
}

export function getCompanyJob(ns: NS): CompanyName | undefined {
	const companyFactions = ["Bachman & Associates",
		"ECorp",
		"Fulcrum Technologies",
		"Clarke Incorporated",
		"OmniTek Incorporated",
		"NWO",
		"Blade Industries",
		"MegaCorp",
		"KuaiGong International"] as CompanyName[];
	return companyFactions.find(fac => ns.getPlayer().jobs[fac] != undefined);
}

export function quitEveryJob(ns: NS): void {
	let playerjob = getCompanyJob(ns);
	while (playerjob != undefined) {
		ns.singularity.quitJob(playerjob);
		playerjob = getCompanyJob(ns);
	}
}

export async function wageSlavery(ns: NS, focus: boolean): Promise<void> {
	let job = getCompanyJob(ns);
	if (job != undefined) {
		ns.singularity.applyToCompany(job, "IT");
		ns.singularity.workForCompany(job, focus);
		await ns.sleep(10000);
	}
	ns.singularity.stopAction();
}

/**
 * A function to run while waiting for money to afford something, commits homicide if the chance is at least 50%, mugs otherwise.
 * If a faction company job is detected it will work there instead.
 * RAM cost: 64/16/4 GB
 * @param ns BitBurner NS object
 * @param focus boolean for if the work should be focused on
 */
export async function moneyTimeKill(ns: NS, focus: boolean): Promise<void> {
	if (getCompanyJob(ns) != undefined) { await wageSlavery(ns, focus); }
	else if (ns.singularity.getCrimeChance("Homicide") > 0.5) { await ns.sleep(ns.singularity.commitCrime("Homicide", focus)); }
	else { await ns.sleep(ns.singularity.commitCrime("Mug", focus)); }
	ns.singularity.stopAction();
}

export async function cityTravel(ns: NS, target: string, focus: boolean): Promise<void> {
	let citytarg = target as CityName;
	if (citytarg != ns.getPlayer().city) { while (!ns.singularity.travelToCity(citytarg)) { await moneyTimeKill(ns, focus); } }
}

export async function trainPlayerCombat(ns: NS, target: number, focus: boolean): Promise<void> {
	let combatstats = lowestCombatStat(ns, ns.getPlayer());
	await cityTravel(ns, "Sector-12", focus);
	while (combatstats[1] < target) {
		ns.singularity.gymWorkout("Powerhouse Gym", combatstats[0], focus);
		await ns.sleep(1000);
		combatstats = lowestCombatStat(ns, ns.getPlayer());
	}
	ns.singularity.stopAction();
}

export async function trainHacking(ns: NS, target: number, focus: boolean): Promise<void> {
	await cityTravel(ns, "Volhaven", focus);
	ns.singularity.universityCourse("ZB Institute of Technology", "Algorithms", focus);
	while (ns.getHackingLevel() < target) { await ns.sleep(1000); }
	ns.singularity.stopAction();
}

export async function trainCharisma(ns: NS, target: number, focus: boolean): Promise<void> {
	await cityTravel(ns, "Volhaven", focus);
	ns.singularity.universityCourse("ZB Institute of Technology", "Leadership", focus);
	while (ns.getPlayer().skills.charisma < target) { await ns.sleep(1000); }
	ns.singularity.stopAction();
}

/**
 * Finds the index of a hacknet object whose name is passed as a string. Useful, as many hacknet functions only accept indexes.
 * RAM cost: 4 GB
 * @param ns BitBurner NS object
 * @param name string of the name of a hacknet node/server
 * @returns the index of the hacknet node/server
 */
export function getHacknetIndex(ns: NS, name: string): number {
	let hacknets = [];
	for (let i = 0; i < ns.hacknet.numNodes(); i++) { hacknets.push(ns.hacknet.getNodeStats(i).name); }
	return hacknets.indexOf(name);
}

export function createWorklist(ns: NS, length: number): string[] {
	const playeraugs = ns.singularity.getOwnedAugmentations(true);
	let auglist = [] as string[];
	for (const faction of desiredfactions) {
		const factaugs = ns.singularity.getAugmentationsFromFaction(faction);
		for (const targaug of factaugs) { if (!auglist.includes(targaug) && !playeraugs.includes(targaug)) { auglist.push(targaug); } }
	}
	auglist.sort((a, b) => { return ns.singularity.getAugmentationRepReq(b) - ns.singularity.getAugmentationRepReq(a); })
	auglist = auglist.filter(aug => ns.singularity.getAugmentationPrereq(aug).every(aug => playeraugs.includes(aug)))
	auglist = auglist.filter(aug => ns.singularity.getAugmentationFactions(aug).some(fac => ns.getPlayer().factions.includes(fac))).slice(-1 * length);
	auglist.sort((a, b) => { return ns.singularity.getAugmentationPrice(b) - ns.singularity.getAugmentationPrice(a); })
	return auglist;
}

export const hackFactions = [
	"Netburners",
	"CyberSec",
	"NiteSec",
	"The Black Hand",
	"BitRunners",
	"Fulcrum Secret Technologies"
];

export async function joinFirstHackers(ns: NS, focus: boolean): Promise<void> {
	const hackFactionsMask = [
		undefined,
		"CSEC",
		"avmnite-02h",
		"I.I.I.I",
		"run4theh111z",
		"fulcrumassets"
	];
	let target = hackFactions.find(fac => factionHasAugs(ns, fac));
	if (target != undefined && !ns.getPlayer().factions.includes(target)) {
		let server = hackFactionsMask[hackFactions.indexOf(target)];
		if (server != undefined) {
			let hacktarg = ns.getServerRequiredHackingLevel(server);
			if (!ns.getServer(server).backdoorInstalled) {
				popTheHood(ns, server);
				while (hacktarg > ns.getHackingLevel()) { await trainHacking(ns, hacktarg, focus); }
				remoteConnect(ns, server);
				await ns.singularity.installBackdoor();
				ns.singularity.connect("home");
			}
			if (target != "Fulcrum Secret Technologies") {
				while (!ns.singularity.checkFactionInvitations().includes(target)) { await moneyTimeKill(ns, focus); }
				ns.singularity.joinFaction(target);
			}
		} else {
			while (!ns.singularity.checkFactionInvitations().includes(target)) { await trainHacking(ns, 80, focus); }
			ns.singularity.joinFaction(target);
		}
		ns.singularity.stopAction();
	}
}

export const cityFactions = [
	"Sector-12",
	"Aevum",
	"Chongqing",
	"New Tokyo",
	"Ishima",
	"Volhaven"
];

export async function joinCityFactions(ns: NS, focus: boolean): Promise<void> {
	const cityFactionsMask = [["Sector-12", "Aevum"], ["Chongqing", "New Tokyo", "Ishima"], ["Volhaven"]];
	if (cityFactionsMask[0].some(fac => factionHasAugs(ns, fac))) {
		for (const city of cityFactionsMask[0]) {
			if (!ns.getPlayer().factions.includes(city)) {
				await cityTravel(ns, city, focus);
				while (!ns.singularity.checkFactionInvitations().includes(city)) { await moneyTimeKill(ns, focus); }
				ns.singularity.joinFaction(city);
			}
		}
	} else {
		if (cityFactionsMask[1].some(fac => factionHasAugs(ns, fac))) {
			for (const city of cityFactionsMask[1]) {
				if (!ns.getPlayer().factions.includes(city)) {
					await cityTravel(ns, city, focus);
					while (!ns.singularity.checkFactionInvitations().includes(city)) { await moneyTimeKill(ns, focus); }
					ns.singularity.joinFaction(city);
				}
			}
		} else {
			if (cityFactionsMask[2].some(fac => factionHasAugs(ns, fac))) {
				for (const city of cityFactionsMask[2]) {
					if (!ns.getPlayer().factions.includes(city)) {
						await cityTravel(ns, city, focus);
						while (!ns.singularity.checkFactionInvitations().includes(city)) { await moneyTimeKill(ns, focus); }
						ns.singularity.joinFaction(city);
					}
				}
			}
		}
	}
	ns.singularity.stopAction();
}

export const companyFactions = [
	"Bachman & Associates",
	"ECorp",
	"Fulcrum Secret Technologies",
	"Clarke Incorporated",
	"OmniTek Incorporated",
	"NWO",
	"Blade Industries",
	"MegaCorp",
	"KuaiGong International"
];

export async function joinFirstCompany(ns: NS, focus: boolean): Promise<void> {
	quitEveryJob(ns);
	const companyFactionsMask = [
		"Bachman & Associates",
		"ECorp",
		"Fulcrum Technologies",
		"Clarke Incorporated",
		"OmniTek Incorporated",
		"NWO",
		"Blade Industries",
		"MegaCorp",
		"KuaiGong International"
	] as CompanyName[];
	let target = companyFactions.find(fac => (factionHasAugs(ns, fac) && !ns.getPlayer().factions.includes(fac)));
	if (target != undefined) {
		let targetjob = companyFactionsMask[companyFactions.indexOf(target)];
		await trainHacking(ns, ns.singularity.getCompanyPositionInfo(targetjob, "IT Intern").requiredSkills.hacking, focus);
		ns.singularity.applyToCompany(targetjob, "IT");
		ns.singularity.stopAction();
	}
}

export async function graduateCompany(ns: NS, focus: boolean): Promise<void> {
	const companyFactionsMask = [
		"Bachman & Associates",
		"ECorp",
		"Fulcrum Technologies",
		"Clarke Incorporated",
		"OmniTek Incorporated",
		"NWO",
		"Blade Industries",
		"MegaCorp",
		"KuaiGong International"
	] as CompanyName[];
	let target = getCompanyJob(ns);
	if (target != undefined) {
		let targfac = companyFactions[companyFactionsMask.indexOf(target)]
		while (!ns.singularity.checkFactionInvitations().includes(targfac)) { await wageSlavery(ns, focus); }
		ns.singularity.joinFaction(targfac);
	}
}

export const crimeFactions = [
	"Tian Di Hui",
	"Slum Snakes",
	"Tetrads",
	"The Syndicate",
	"The Dark Army",
	"Speakers for the Dead",
	"Silhouette"
];

export async function joinFirstCrime(ns: NS, focus: boolean): Promise<void> {
	const crimeFactionsMask = [
		[0, 0, "Chongqing"],
		[30, -9, undefined],
		[75, -18, "Chongqing"],
		[200, -90, "Sector-12"],
		[300, -45, "Chongqing"],
		[300, -45, undefined],
		[0, -22, undefined]
	];
	let target = crimeFactions.find(fac => factionHasAugs(ns, fac));
	if (target != undefined && !ns.getPlayer().factions.includes(target)) {
		let crimereqs = crimeFactionsMask[crimeFactions.indexOf(target)];
		await trainPlayerCombat(ns, crimereqs[0] as number, focus);
		while (getKarma(ns) > (crimereqs[1] as number)) {
			if (ns.singularity.getCrimeChance("Homicide") > 0.5) { await ns.sleep(ns.singularity.commitCrime("Homicide", focus)); }
			else { await ns.sleep(ns.singularity.commitCrime("Mug", focus)); }
		}
		if (crimereqs[2] != undefined) { await cityTravel(ns, crimereqs[2] as string, focus); }
		if (target != "Silhouette") {
			while (!ns.singularity.checkFactionInvitations().includes(target)) {
				if (ns.singularity.getCrimeChance("Homicide") > 0.5) { await ns.sleep(ns.singularity.commitCrime("Homicide", focus)); }
				else { await ns.sleep(ns.singularity.commitCrime("Mug", focus)); }
			}
			ns.singularity.joinFaction(target);
		}
		ns.singularity.stopAction();
	}
}

export const secretFactions = [
	"Daedalus",
	"The Covenant",
	"Illuminati"
];

export async function joinFirstSecret(ns: NS, focus: boolean): Promise<void> {
	const secretFactionsMask = [
		[30 + ns.getBitNodeMultipliers().DaedalusAugsRequirement, 2500, 1500],
		[20, 850, 850],
		[30, 1500, 1200]
	];
	let target = secretFactions.find(fac => factionHasAugs(ns, fac));
	if (target != undefined && !ns.getPlayer().factions.includes(target)) {
		let secretreqs = secretFactionsMask[secretFactions.indexOf(target)];
		if (ns.singularity.getOwnedAugmentations(false).length >= secretreqs[0]) {
			await trainHacking(ns, secretreqs[1], focus);
			if (ns.singularity.checkFactionInvitations().includes(target)) { ns.singularity.joinFaction(target); }
			else {
				await trainPlayerCombat(ns, secretreqs[2], focus);
				while (!ns.singularity.checkFactionInvitations().includes(target)) { await moneyTimeKill(ns, focus); }
				ns.singularity.joinFaction(target);
			}
		}
	}
}
