import { CompanyName, NS } from "@ns";

/**
 * A hardcoded list of most of the normal factions in the game, ordered in a rough descending list of work priority. 
 */
export const desiredfactions = ["Netburners", //0, hacknet upgrades, cheap and usually helpful
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
	"The Covenant"];

export const companyFactions = ["Bachman & Associates",
	"ECorp",
	"Fulcrum Secret Technologies",
	"Clarke Incorporated",
	"OmniTek Incorporated",
	"NWO",
	"Blade Industries",
	"MegaCorp",
	"KuaiGong International"] as CompanyName[];

/**
 * Creates an array detailing the server network, in the form of string pairs. 
 * The first of a pair is the name of a server, the second is the name of the server that is one step closer to home.
 * RAM cost: 4.25 GB
 * @param ns BitBurner NS object
 * @returns an array containing server name string pair arrays
 */
export function netScan(ns: NS): string[][] {
	let excludedservers = ns.getPurchasedServers();
	for (let i = 0; i < ns.hacknet.numNodes(); i++) { excludedservers.push(ns.hacknet.getNodeStats(i).name); }
	excludedservers.push("w0r1d_d43m0n");
	excludedservers.push("darkweb");
	let currentserver = "home";
	let scanservers = ["home"];
	let knownservers = [] as Array<string>;
	let servermap = [["home", "home"]];
	while (scanservers.length > 0) {
		currentserver = scanservers[0];
		knownservers.push(currentserver);
		for (const scantarg of ns.scan(currentserver)) {
			if (!scanservers.includes(scantarg) && !knownservers.includes(scantarg) && !excludedservers.includes(scantarg)) {
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
 * Relies on an existing networkmap.txt.
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
 * RAM cost: 0.5 GB
 * @param ns BitBurner NS object
 * @returns an array of the string and number of the lowest combat stat
 */
export function lowestCombatStat(ns: NS): [string, number] {
	const strength = ["strength", ns.getPlayer().skills.strength] as [string, number];
	const defense = ["defense", ns.getPlayer().skills.defense] as [string, number];
	const dexterity = ["dexterity", ns.getPlayer().skills.dexterity] as [string, number];
	const agility = ["agility", ns.getPlayer().skills.agility] as [string, number];
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
	if (ns.gang.inGang()) {
		factionaugs = factionaugs.filter(aug => ns.singularity.getAugmentationsFromFaction(ns.gang.getGangInformation().faction).includes(aug));
	}
	return (factionaugs.length > 0);
}

/**
 * A function to run while waiting for money to afford something, commits homicide if the chance is at least 50%, mugs otherwise.
 * RAM cost: 176/44/11 GB
 * @param ns BitBurner NS object
 * @param focus boolean for if the crime should be focused on
 */
export async function moneyTimeKill(ns: NS, focus: boolean): Promise<void> {
	if (ns.singularity.getCrimeChance("Homicide") > 0.5) { await ns.sleep(ns.singularity.commitCrime("Homicide", focus)); }
	else { await ns.sleep(ns.singularity.commitCrime("Mug", focus)); }
	ns.singularity.stopAction();
}

export async function setupCrimeFaction(ns: NS, stats: number, karma: number, focus: boolean): Promise<void> {
	let combatstats = lowestCombatStat(ns);
	while (!ns.singularity.travelToCity("Sector-12")) { await moneyTimeKill(ns, focus); }
	while (combatstats[1] < stats) {
		ns.singularity.gymWorkout("Powerhouse Gym", combatstats[0], focus);
		await ns.sleep(1000);
		combatstats = lowestCombatStat(ns);
	}
	ns.singularity.stopAction();
	let currentkarma = getKarma(ns);
	while (currentkarma > karma) {
		if (ns.singularity.getCrimeChance("Homicide") > 0.5) { await ns.sleep(ns.singularity.commitCrime("Homicide", focus)); }
		else { await ns.sleep(ns.singularity.commitCrime("Mug", focus)); }
	}
	ns.singularity.stopAction();
}

export async function setupHackFaction(ns: NS, server: string, focus: boolean): Promise<void> {
	while (!popTheHood(ns, server)) { await moneyTimeKill(ns, focus); }
	while (ns.getServerRequiredHackingLevel(server) > ns.getHackingLevel()) { await moneyTimeKill(ns, focus); }
	if (!ns.getServer(server).backdoorInstalled) {
		remoteConnect(ns, server);
		await ns.singularity.installBackdoor();
		ns.singularity.connect("home");
	}
}