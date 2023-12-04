import { Multipliers, NS } from "@ns";

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
 * Checks if a given augment affects a desirable stat - hacking, repuation, charisma, or hacknet - 
 * or is one of three special desired augments - CashRoot, NMI, or Red Pill. 
 * RAM cost: 80/20/5 GB
 * @param ns BitBurner NS object
 * @param augment name of an augment as a string
 * @returns true if the passed augment is desireable, false otherwise
 */
export function hasDesiredStats(ns: NS, augment: string): boolean {
	const desiredstats: (keyof Multipliers)[] = ["charisma", "charisma_exp", "company_rep", "faction_rep", "hacking", "hacking_chance",
		"hacking_exp", "hacking_grow", "hacking_money", "hacking_speed", "hacknet_node_money"];
	const desiredaugs = ["CashRoot Starter Kit", "Neuroreceptor Management Implant", "The Red Pill"]; //"The Blade's Simulacrum", 
	if (desiredaugs.includes(augment)) { return true; }
	else {
		let augstats = ns.singularity.getAugmentationStats(augment);
		return desiredstats.some(stat => augstats[stat] > 1);
	}
}

/**
 * Checks if a given faction still has unowned desireable augments to buy. 
 * RAM cost: 240/60/15 GB
 * @param ns BitBurner NS object
 * @param faction string of a faction name to check for augments
 * @param combat false filters for augments with desired stats, true includes all augments
 * @returns true if faction still has desired augments to get, false otherwise
 */
export function factionHasAugs(ns: NS, faction: string, combat: boolean): boolean {
	let factionaugs = ns.singularity.getAugmentationsFromFaction(faction);
	factionaugs = factionaugs.filter(aug => !ns.singularity.getOwnedAugmentations(true).includes(aug));
	if (!combat) { factionaugs = factionaugs.filter(aug => hasDesiredStats(ns, aug)); }
	return (factionaugs.length > 0);
}
