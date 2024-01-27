import ReactLib from 'react';
declare const React: typeof ReactLib;
import {
	AugmentPair,
	Bladeburner, CityName, CodingContract, CompanyName, Corporation, CrimeType, Gang, Grafting, JobName, Multipliers, NS, Player, PlayerRequirement, ReactElement,
	Singularity, SkillRequirement, Skills, Sleeve, SleevePerson, SleeveTask, Stanek, TIX
} from "@ns";

// every possible function type is a subtype of this
type AnyFn = (...args: any) => any;

// if F is the type of some function, Asynced<F> is a function that is exactly the same except it returns a Promise<whatever F returns>
type Asynced<F extends AnyFn> = (...args: Parameters<F>) => Promise<Awaited<ReturnType<F>>>;

type DispatchMethods<Namespace> = {
	[Method in string & keyof Namespace as `${Method}D`]: Namespace[Method] extends AnyFn ? Asynced<Namespace[Method]> : never;
};

type Proxied<T> = T & DispatchMethods<T>;

// additional things for NS specifically: all of the sub-namespaces can be proxied too
export interface ProxyNS extends Proxied<NS> {
	readonly bladeburner: Proxied<Bladeburner>;
	readonly codingcontract: Proxied<CodingContract>;
	readonly corporation: Proxied<Corporation>;
	readonly gang: Proxied<Gang>;
	readonly grafting: Proxied<Grafting>;
	readonly singularity: Proxied<Singularity>;
	readonly sleeve: Proxied<Sleeve>;
	readonly stock: Proxied<TIX>;
	readonly stanek: Proxied<Stanek>;
}

export async function asyncFilter<T>(input: T[], testFunc: (item: T) => Promise<boolean>): Promise<T[]> {
	const result: T[] = [];
	for (const item of input) {
		if (await testFunc(item)) {
			result.push(item);
		}
	}
	return result;
}

export async function sortByAsyncKey<T>(input: T[], calculateKey: (item: T) => Promise<number>): Promise<T[]> {
	const keys = new Map<T, number>();
	for (const item of input) {
		keys.set(item, await calculateKey(item));
	}
	return input.sort((itemA, itemB) => {
		const keyA = keys.get(itemA), keyB = keys.get(itemB);
		if (keyA === undefined || keyB === undefined) throw 'unreachable';
		return keyA - keyB; // sort lowest to highest; to sort highest to lowest, make calculateKey return the thing times -1
	});
}

/**
 * A hardcoded list of most of the normal factions in the game, ordered in a rough descending list of work priority. 
 */
export const desiredfactions = [
	"Netburners",
	"Tian Di Hui",
	"Aevum",
	"CyberSec",
	"Chongqing",
	"New Tokyo",
	"Ishima",
	"Sector-12",
	"NiteSec",
	"Tetrads",
	"Bachman & Associates",
	"BitRunners",
	"ECorp",
	"Daedalus",
	"Fulcrum Secret Technologies",
	"The Black Hand",
	"The Dark Army",
	"Clarke Incorporated",
	"OmniTek Incorporated",
	"NWO",
	"Blade Industries",
	"The Covenant",
	"Illuminati",
	"Slum Snakes",
	"Volhaven",
	"Speakers for the Dead",
	"The Syndicate",
	"MegaCorp",
	"KuaiGong International",
	"Silhouette"
];

/**
 * A list of names for naming gang members with. Yes, those are Seinfield, Lucky Star, and Adventure Time character names. Sue me.
 */
export const gangNames = [
	"Jerry",
	"George",
	"Elaine",
	"Kramer",
	"Konata",
	"Kagami",
	"Miyuki",
	"Tsukasa",
	"Finn",
	"Jake",
	"Bonnibel",
	"Marcilene"
];

/**
 * A function for attempting to gather up all the usual log-disables I tend to use. 
 * Probably going to phase this out, but the name reference is fun.
 * @param ns BitBurner NS object
 */
export function quietTheBabblingThrong(ns: NS): void {
	ns.disableLog('disableLog');
	ns.disableLog('sleep');
	ns.disableLog('asleep');
	ns.disableLog('brutessh');
	ns.disableLog('ftpcrack');
	ns.disableLog('relaysmtp');
	ns.disableLog('httpworm');
	ns.disableLog('sqlinject');
	ns.disableLog('nuke');
	ns.disableLog('scan');
	ns.disableLog('scp');
	ns.disableLog('exec');
	ns.disableLog('getServerMoneyAvailable');
	ns.disableLog('getServerMaxMoney');
	ns.disableLog('getServerUsedRam');
	ns.disableLog('getServerMaxRam');
	ns.disableLog('getHackingLevel');
	ns.disableLog('getServerRequiredHackingLevel');
	ns.disableLog('singularity.commitCrime');
	ns.disableLog('singularity.gymWorkout');
	ns.disableLog('singularity.applyToCompany');
	ns.disableLog('singularity.workForCompany');
	ns.disableLog('singularity.purchaseAugmentation');
}

async function callInSubprocess(ns: NS, fn: string, args: any[]): Promise<any> {
	const id = 0;
	const reply = ns.pid;
	const ramcost = 1.6 + ns.getFunctionRamCost(fn);
	let ramhost = "home";
	while ((ns.getServerMaxRam(ramhost) - ns.getServerUsedRam(ramhost)) < ramcost) {
		await ns.sleep(1);
	}
	ns.exec(
		'memalloc.js',
		ramhost,
		{ ramOverride: ramcost, temporary: true },
		reply, id, fn, ...args.map(arg => JSON.stringify(arg))
	)
	let data = ns.readPort(reply);
	while (data == "NULL PORT DATA") {
		await ns.sleep(1);
		data = ns.readPort(reply);
	}
	return JSON.parse(data.toString()).result;
}

function makeSubproxy(ns: NS, somename: string | symbol, realvalue: any): any {
	const wrappedNS = new Proxy(realvalue, {
		get(subns, property) {
			const realvalue = (subns as any)[property];
			if (typeof realvalue === 'object' && !Array.isArray(realvalue)) {
				return makeSubproxy(ns, property, realvalue);
			} else if (realvalue !== undefined) {
				return realvalue;
			}
			if (realvalue !== undefined) return realvalue;
			if (typeof property !== 'string') return undefined;
			if (!property.endsWith('D')) return undefined;
			const realFunction = property.slice(0, -1);
			if (typeof (subns as any)[realFunction] !== "function") return undefined;
			const proxiedFunc = async (...args: any[]) => {
				const result = callInSubprocess(ns, somename as string + "." + realFunction, args);
				return result;
			};
			return proxiedFunc;
		}
	});
	return wrappedNS as any;
}

export function wrapNS(ns: NS): ProxyNS {
	const wrappedNS = new Proxy(ns, {
		get(ns, property) {
			const realvalue = (ns as any)[property];
			if (typeof realvalue === 'object' && !Array.isArray(realvalue)) {
				return makeSubproxy(ns, property, realvalue);
			} else if (realvalue !== undefined) {
				return realvalue;
			}
			if (realvalue !== undefined) return realvalue;
			if (typeof property !== 'string') return undefined;
			if (!property.endsWith('D')) return undefined;
			const realFunction = property.slice(0, -1);
			if (typeof (ns as any)[realFunction] !== "function") return undefined;
			const proxiedFunc = async (...args: any[]) => {
				const result = callInSubprocess(ns, realFunction, args);
				return result;
			};
			return proxiedFunc;
		}
	});
	return wrappedNS as any;
}

/**
 * Creates an array detailing the server network, in the form of string pairs. 
 * The first of a pair is the name of a server, the second is the name of the server that is one step closer to home.
 * @param ns BitBurner NS object
 * @returns an array containing server name string pair arrays
 */
export function netScan(ns: NS): string[][] {
	let currentserver = "home";
	let scanservers = ["home"];
	let knownservers = [] as string[];
	let servermap = [["home", "home"]];
	while (scanservers.length > 0) {
		currentserver = scanservers[0];
		knownservers.push(currentserver);
		for (const scantarg of ns.scan(currentserver)) {
			if (!scanservers.includes(scantarg) && !knownservers.includes(scantarg)) {
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
 * @param ns BitBurner NS object
 * @param target string of the server to connect to
 */
export function remoteConnect(ns: NS, target: string): void {
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

export function getServerReservation(ns: NS, server: string): number {
	if (server === 'home') {
		return Math.max(Math.trunc(ns.getServerMaxRam(server) / 4), 128)
	} else if (server.includes("hacknet")) {
		return Math.trunc(ns.getServerMaxRam(server) / 2)
	} else {
		return 0
	}
}

export function getDynamicRAM(ns: NS, servers: string[]): { name: string, freeRam: number } {
	let ramlist = servers.map(name => ({
		name,
		freeRam: ns.getServerMaxRam(name) - ns.getServerUsedRam(name) - getServerReservation(ns, name)
	}));
	return ramlist.reduce((highestRam, currentRam) => currentRam.freeRam > highestRam.freeRam ? currentRam : highestRam);
}

export async function openTheDoor(ns: NS, target: string, wait: boolean): Promise<void> {
	if (popTheHood(ns, target) && (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(target)) && !ns.getServer(target).backdoorInstalled) {
		let ramserver = getDynamicRAM(ns, masterLister(ns).filter(serv => (ns.hasRootAccess(serv) && (ns.getServerMaxRam(serv) > 0)))).name;
		ns.scp("mandoor.js", ramserver, "home");
		remoteConnect(ns, target);
		let pid = ns.exec("mandoor.js", ramserver);
		await ns.sleep(1);
		ns.singularity.connect("home");
		if (wait) { while (ns.isRunning(pid)) { await ns.sleep(1000); } }
	}
}

/**
 * Creates an array of strings of names of all the servers with current or possible root access.
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

export async function augLister(ns: NS): Promise<string[]> {
	let auglist = [] as string[];
	for (const faction of desiredfactions) {
		const factaugs = await wrapNS(ns).singularity.getAugmentationsFromFactionD(faction);
		for (const targaug of factaugs) { if (!auglist.includes(targaug)) { auglist.push(targaug); } }
	}
	return auglist.sort((a, b) => { return ns.singularity.getAugmentationRepReq(a) - ns.singularity.getAugmentationRepReq(b); });
}

export async function augFilteredLister(ns: NS): Promise<string[]> {
	const playeraugs = await wrapNS(ns).singularity.getOwnedAugmentationsD(true);
	let auglist = [] as string[];
	for (const faction of ns.getPlayer().factions) {
		const factaugs = await wrapNS(ns).singularity.getAugmentationsFromFactionD(faction);
		for (const targaug of factaugs) { if (!auglist.includes(targaug) && !playeraugs.includes(targaug)) { auglist.push(targaug); } }
	}
	auglist = await asyncFilter(auglist, (async aug => (await wrapNS(ns).singularity.getAugmentationPrereqD(aug)).every(aug => playeraugs.includes(aug))));
	return auglist.sort((a, b) => { return ns.singularity.getAugmentationRepReq(a) - ns.singularity.getAugmentationRepReq(b); });
}

/**
 * Returns an array of the string and level of the lowest of the combat stats of the player or sleeve passed as an argument.
 * @param ns BitBurner NS object
 * @param target the player object, or that of a sleeve
 * @returns an array of the string and number of the lowest combat stat
 */
export function lowestCombatStat(target: Player | SleevePerson): { name: string, value: number } {
	const statNames: (keyof Skills)[] = [
		'strength',
		'defense',
		'dexterity',
		'agility'
	];
	const statObjects = statNames.map(name => ({
		name,
		value: target.skills[name]
	}));
	return statObjects.reduce((lowestStat, currentStat) => currentStat.value < lowestStat.value ? currentStat : lowestStat);
}

/**
 * Evals an undocumented function call to grab a secret value, the player's current karma.
 * @param ns BitBurner NS object
 * @returns number of current karma, usually negative
 */
export function getKarma(ns: NS): number {
	return eval("ns.heart.break()");
}

/**
 * Checks for the Neuroreceptor Management Implant, and returns true if lacking the aug, to avoid unfocused work penalties.
 * @param ns BitBurner NS object
 * @returns returns true if the unfocused work penalty applies, false otherwise
 */
export async function hasFocusPenalty(ns: NS): Promise<boolean> {
	return !(await wrapNS(ns).singularity.getOwnedAugmentationsD()).includes("Neuroreceptor Management Implant");
}

/**
 * Checks if a given faction still has unowned augments to buy. 
 * Notably, if a gang exists, non-gang factions passed to this will exclude augments the gang offers.
 * This can result in the function returning false far more often once a gang is joined. 
 * @param ns BitBurner NS object
 * @param faction string of a faction name to check for augments
 * @returns true if faction still has augments left to get, false otherwise
 */
export async function factionHasAugs(ns: NS, faction: string): Promise<boolean> {
	let factionaugs = await wrapNS(ns).singularity.getAugmentationsFromFactionD(faction);
	const ownedAugs = await wrapNS(ns).singularity.getOwnedAugmentationsD(true);
	factionaugs = factionaugs.filter(async aug => !ownedAugs.includes(aug));
	if (ns.gang.inGang() && ns.gang.getGangInformation().faction != faction) {
		const gangAugs = await wrapNS(ns).singularity.getAugmentationsFromFactionD(ns.gang.getGangInformation().faction);
		factionaugs = factionaugs.filter(async aug => !gangAugs.includes(aug));
	}
	return (factionaugs.length > 0);
}

export async function getRemainingFactions(ns: NS): Promise<string[]> {
	return await asyncFilter(desiredfactions, async fac => await factionHasAugs(ns, fac));
}

export function getPlayerJobs(ns: NS): [CompanyName, JobName][] { return Object.entries(ns.getPlayer().jobs) as [CompanyName, JobName][]; }

export async function getCrimeProfit(ns: NS, crime: CrimeType, person: Player | SleevePerson): Promise<number> {
	return (ns.formulas.work.crimeGains(person, crime).money /
		(await wrapNS(ns).singularity.getCrimeStatsD(crime)).time) *
		ns.formulas.work.crimeSuccessChance(person, crime);
}

/**
 * Attempts to work for the player's company job 10 seconds, applying for an IT promotion each time.
 * @param ns BitBurner NS object
 * @param focus boolean for if the work should be focused on
 */
export async function wageSlavery(ns: NS, focus: boolean): Promise<void> {
	let job = getPlayerJobs(ns)[0];
	ns.singularity.applyToCompany(job[0], "IT");
	ns.singularity.workForCompany(job[0], focus);
	await ns.sleep(10000);
	ns.singularity.stopAction();
}

export function getStabbin(ns: NS, person: Player | SleevePerson): "Homicide" | "Mug" {
	return (ns.formulas.work.crimeSuccessChance(person, "Homicide") >= 0.5) ? "Homicide" : "Mug"
}

export async function goCrimin(ns: NS, focus: boolean): Promise<void> {
	await ns.sleep(await wrapNS(ns).singularity.commitCrimeD(getStabbin(ns, ns.getPlayer()), focus));
	ns.singularity.stopAction();
}

export async function isSleeveReady(ns: NS, sleeve: number): Promise<boolean> {
	const sleevestats = await wrapNS(ns).sleeve.getSleeveD(sleeve);
	return sleevestats.shock == 0 && sleevestats.sync == 100;
}

export async function getReadySleeveNum(ns: NS): Promise<number> {
	const sleevecount = await wrapNS(ns).sleeve.getNumSleevesD();
	let readysleeves = 0;
	for (let i = 0; i < sleevecount; i++) { if (await isSleeveReady(ns, i)) { readysleeves++; } }
	return readysleeves;
}

export async function groupResetTask(ns: NS, focus: boolean): Promise<void> {
	ns.singularity.stopAction();
	await wrapNS(ns).singularity.commitCrimeD(getStabbin(ns, ns.getPlayer()), focus);
	const sleevecount = await wrapNS(ns).sleeve.getNumSleevesD();
	for (let i = 0; i < sleevecount; i++) {
		if (await isSleeveReady(ns, i)) {
			const sleevestats = await wrapNS(ns).sleeve.getSleeveD(i);
			await wrapNS(ns).sleeve.setToCommitCrimeD(i, getStabbin(ns, sleevestats));
		}
	}
}

export function getBestWork(ns: NS, person: Player | SleevePerson): any {
	let crimeprofit = getCrimeProfit(ns, (getStabbin(ns, person)) as CrimeType, person);
	let jobslist = getPlayerJobs(ns);
}

/**
 * A function to run while waiting for money to afford something, commits homicide if the chance is at least 50%, mugs otherwise.
 * If a company job is detected it will work there instead.
 * @param ns BitBurner NS object
 * @param focus boolean for if the work should be focused on
 */
export async function moneyTimeKill(ns: NS, focus: boolean): Promise<void> {
	if (getPlayerJobs(ns).length > 0) { await wageSlavery(ns, focus); }
	else { await goCrimin(ns, focus); }
	ns.singularity.stopAction();
}

/**
 * Attempts to travel to a given city. 
 * Used over travelToCity as it won't attempt to travel to your current city, accepts a string, and will earn money if it cannot afford the flight.
 * @param ns BitBurner NS object
 * @param target string of the name of the city to attempt to be in
 * @param focus boolean for if the work should be focused on
 */
export async function cityTravel(ns: NS, target: string, focus: boolean): Promise<void> {
	let citytarg = target as CityName;
	if (citytarg != ns.getPlayer().city) { while (!ns.singularity.travelToCity(citytarg)) { await moneyTimeKill(ns, focus); } }
}

export async function groupTravel(ns: NS, target: string, focus: boolean): Promise<void> {
	//ns.sleeve.travel()
}

/**
 * Travels the player to Sector-12 to work out at Powerhouse Gym until all stats are at least the given number. 
 * Will always train the lowest stat first, alternating between them to keep them somewhat balanced.
 * @param ns BitBurner NS object
 * @param target number of the goal combat stats to reach
 * @param focus boolean for if the work should be focused on
 */
export async function trainPlayerCombat(ns: NS, target: number, focus: boolean): Promise<void> {
	let combatstats = lowestCombatStat(ns.getPlayer());
	await cityTravel(ns, "Sector-12", focus);
	await openTheDoor(ns, "powerhouse-fitness", false);
	while (combatstats.value < target) {
		ns.singularity.gymWorkout("Powerhouse Gym", combatstats.name, focus);
		await ns.sleep(1000);
		combatstats = lowestCombatStat(ns.getPlayer());
	}
	ns.singularity.stopAction();
}

/**
 * Travels to Volhaven to take Algorithms courses at ZB Institute of Technology until hacking level reaches the given number.
 * @param ns BitBurner NS object
 * @param target number of the goal hacking level to reach
 * @param focus boolean for if the work should be focused on
 */
export async function trainHacking(ns: NS, target: number, focus: boolean): Promise<void> {
	await cityTravel(ns, "Volhaven", focus);
	await openTheDoor(ns, "zb-institute", false);
	ns.singularity.universityCourse("ZB Institute of Technology", "Algorithms", focus);
	while (ns.getHackingLevel() < target) { await ns.sleep(1000); }
	ns.singularity.stopAction();
}

/*
export async function trainCharisma(ns: NS, target: number, focus: boolean): Promise<void> {
	await cityTravel(ns, "Volhaven", focus);
	ns.singularity.universityCourse("ZB Institute of Technology", "Leadership", focus);
	while (ns.getPlayer().skills.charisma < target) { await ns.sleep(1000); }
	ns.singularity.stopAction();
}
*/

/**
 * Finds the index of a hacknet object whose name is passed as a string. Useful, as many hacknet functions only accept indexes.
 * @param ns BitBurner NS object
 * @param name string of the name of a hacknet node/server
 * @returns the index of the hacknet node/server
 */
export function getHacknetIndex(ns: NS, name: string): number {
	let hacknets = [];
	for (let i = 0; i < ns.hacknet.numNodes(); i++) { hacknets.push(ns.hacknet.getNodeStats(i).name); }
	return hacknets.indexOf(name);
}

export function getHacknetBudget(ns: NS): number {
	const currentration = 0.25;
	let expensegap = Math.max(0, ns.getMoneySources().sinceInstall.hacknet + ns.getMoneySources().sinceInstall.hacknet_expenses);
	let budget = Math.floor(ns.getServerMoneyAvailable("home") * currentration);
	return Math.min(expensegap, budget);
}

export function getTotalHacknetStats(ns: NS): { levels: number, ram: number, cores: number, cache: number } {
	let finalcount = {
		levels: 0,
		ram: 0,
		cores: 0,
		cache: 0
	};
	for (let i = 0; i < ns.hacknet.numNodes(); i++) {
		finalcount.levels += ns.hacknet.getNodeStats(i).level;
		finalcount.ram += ns.hacknet.getNodeStats(i).ram;
		finalcount.cores += ns.hacknet.getNodeStats(i).cores;
		finalcount.cache += ns.hacknet.getNodeStats(i).cache ?? 0;
	}
	return finalcount;
}

export function hasNetburnerStats(ns: NS): boolean {
	let hacknetstats = getTotalHacknetStats(ns);
	let trutharray = [] as boolean[];
	trutharray.push(hacknetstats.levels >= 100);
	trutharray.push(hacknetstats.ram >= 8);
	trutharray.push(hacknetstats.cores >= 4);
	trutharray.push(hacknetstats.cache >= 5);
	return trutharray.every(bool => bool);
}

export function getCompanyServer(ns: NS, company: string): string {
	let masterlist = masterLister(ns);
	return masterlist[masterlist.map(serv => ns.getServer(serv).organizationName).indexOf(company)];
}

export async function getWaitingCount(ns: NS): Promise<number> {
	return ((await wrapNS(ns).singularity.getOwnedAugmentationsD(true)).length) - ((await wrapNS(ns).singularity.getOwnedAugmentationsD(false)).length);
}

/**
 * Creates a worklist, an array of specified length, containing strings of the augments with the lowest rep requirements across all joined factions.
 * The returned array won't contain augments with unment prereqs, and will be sorted in price high -> low.
 * @param ns BitBurner NS object
 * @param length number of the length of the worklist
 * @returns array of strings of augments of the given length, sorted as described
 */
export async function createWorklist(ns: NS, length: number): Promise<string[]> {
	let auglist = (await augFilteredLister(ns)).reverse();
	auglist = auglist.slice(-1 * length);
	auglist.sort((a, b) => { return ns.singularity.getAugmentationPrice(b) - ns.singularity.getAugmentationPrice(a); })
	return auglist;
}

/*
export async function createWorklistNew(ns: NS, length: number): Promise<[string, string][]> {
	let gangfac = "";
	let gangaugs = [];
	if (ns.gang.inGang()) {
		gangfac = ns.gang.getGangInformation().faction;
		gangaugs = await wrapNS(ns).singularity.getAugmentationsFromFactionD(gangfac);
	}
	let auglist = await augLister(ns);
	let worklist = [] as [string, string][];
	let iterator = 0;
	while (worklist.length < length) {
		let targfac = desiredfactions[iterator];
		let facaugs = await wrapNS(ns).singularity.getAugmentationsFromFactionD(targfac);
	}
}
*/

export function getFactionEnemies(faction: string): string[] {
	const cityFactionsMask = [["Sector-12", "Aevum"], ["Chongqing", "New Tokyo", "Ishima"], ["Volhaven"]];
	let enemieslist = [];
	if (cityFactionsMask[0].includes(faction)) {
		enemieslist.push(...cityFactionsMask[1]);
		enemieslist.push(...cityFactionsMask[2]);
	} else if (cityFactionsMask[1].includes(faction)) {
		enemieslist.push(...cityFactionsMask[0]);
		enemieslist.push(...cityFactionsMask[2]);
	} else if (cityFactionsMask[2].includes(faction)) {
		enemieslist.push(...cityFactionsMask[0]);
		enemieslist.push(...cityFactionsMask[1]);
	}
	return enemieslist;
}

export function checkFactionEnemies(ns: NS, faction: string): boolean {
	return ns.getPlayer().factions.every(fac => !getFactionEnemies(fac).includes(faction));
}

export function joinEveryInvitedFaction(ns: NS): void {
	const cityFactions = ["Sector-12", "Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven"];
	if (cityFactions.some(fac => ns.getPlayer().factions.includes(fac))) {
		for (const fac of ns.singularity.checkFactionInvitations()) { ns.singularity.joinFaction(fac); }
	} else {
		for (const fac of ns.singularity.checkFactionInvitations()) { if (!cityFactions.includes(fac)) { ns.singularity.joinFaction(fac); } }
	}
}

export async function trainTheseSkills(ns: NS, skills: Partial<Skills>, focus: boolean): Promise<void> {
	const combatstats = ["str", "def", "dex", "agi"];
	let trainskills = Object.keys(skills).map(skillName => { return { skillName, value: (skills[skillName as keyof Skills] ?? 0) } });
	for (const skill of trainskills) {
		if (skill.skillName == "hacking") { await trainHacking(ns, skill.value, focus); }
		if (combatstats.includes(skill.skillName)) { await trainPlayerCombat(ns, skill.value, focus); }
	}
}

export function reqCheck(ns: NS, req: PlayerRequirement): boolean {
	switch (req.type) {
		case "someCondition": return req.conditions.some(subReq => reqCheck(ns, subReq));
		case "everyCondition": return req.conditions.every(subReq => reqCheck(ns, subReq));
		case "not": return !reqCheck(ns, req.condition);
		case "backdoorInstalled": return ns.getServer(req.server).backdoorInstalled as boolean;
		case "city": return ns.getPlayer().city == req.city;
		case "karma": return getKarma(ns) <= req.karma;
		case "money": return ns.getServerMoneyAvailable("home") >= req.money;
		case "skills": return Object.keys(req.skills).every(skillName => {
			return (req.skills[skillName as keyof Skills] ?? 0) <= ns.getPlayer().skills[skillName as keyof Skills]
		});
		case "numPeopleKilled": return ns.getPlayer().numPeopleKilled >= req.numPeopleKilled;
		case "bitNodeN": return ns.getResetInfo().currentNode == req.bitNodeN;
		case "sourceFile": return ns.getResetInfo().ownedSF.get(req.sourceFile) != undefined;
		case "numAugmentations": return ns.getResetInfo().ownedAugs.size >= req.numAugmentations;
		case "employedBy": return getPlayerJobs(ns).flat().includes(req.company);
		case "jobTitle": return getPlayerJobs(ns).flat().includes(req.jobTitle);
		case "companyReputation": return ns.singularity.getCompanyRep(req.company) >= req.reputation;
		default: return true;
	}
}

export async function reqSolver(ns: NS, req: PlayerRequirement, focus: boolean): Promise<void> {
	switch (req.type) {
		case "someCondition":
			await reqSolver(ns, req.conditions[0], focus);
			break;
		case "everyCondition":
			for (const subreq of req.conditions) { await reqSolver(ns, subreq, focus); }
			break;
		case "backdoorInstalled":
			await trainHacking(ns, ns.getServerRequiredHackingLevel(req.server), focus);
			await openTheDoor(ns, req.server, true);
			break;
		case "city":
			await cityTravel(ns, req.city, focus);
			break;
		case "karma":
			while (getKarma(ns) < req.karma) { await goCrimin(ns, focus); }
			break;
		case "money":
			while (ns.getServerMoneyAvailable("home") < req.money) { await moneyTimeKill(ns, focus); }
			break;
		case "numPeopleKilled":
			while (ns.getPlayer().numPeopleKilled < req.numPeopleKilled) { await ns.sleep(await wrapNS(ns).singularity.commitCrimeD("Homicide", focus)); }
			break;
		case "skills":
			await trainTheseSkills(ns, req.skills, focus);
			break;
		case "employedBy":
			await trainHacking(ns, ns.singularity.getCompanyPositionInfo(req.company, "IT Intern").requiredSkills.hacking, focus);
			ns.singularity.applyToCompany(req.company, "IT");
			break;
		case "companyReputation":
			await trainHacking(ns, ns.singularity.getCompanyPositionInfo(req.company, "IT Intern").requiredSkills.hacking, focus);
			ns.singularity.applyToCompany(req.company, "IT");
			await openTheDoor(ns, getCompanyServer(ns, req.company), false);
			while (ns.singularity.getCompanyRep(req.company) < (req.reputation - (ns.getServer(getCompanyServer(ns, req.company)).backdoorInstalled ? 100000 : 0))) {
				ns.singularity.workForCompany(req.company, focus);
				await ns.sleep(10000);
				ns.singularity.applyToCompany(req.company, "IT");
			}
			break;
		default: ns.tprint("unmet and unsupported requirement: " + req.type);
	}
	ns.singularity.stopAction();
}

export function hasThisReq(reqs: PlayerRequirement[], type: string): boolean {
	let foundit = false;
	for (const req of reqs) {
		if (req.type == "someCondition" && hasThisReq(req.conditions, type)) { foundit = true; }
		if (req.type == "everyCondition" && hasThisReq(req.conditions, type)) { foundit = true; }
		if (req.type == type) { foundit = true; }
	}
	return foundit;
}

export function getThisReq(reqs: PlayerRequirement[], type: string): PlayerRequirement | undefined {
	let thething = undefined;
	for (const req of reqs) {
		if (req.type == "someCondition" && hasThisReq(req.conditions, type)) { thething = getThisReq(req.conditions, type); }
		if (req.type == "everyCondition" && hasThisReq(req.conditions, type)) { thething = getThisReq(req.conditions, type); }
		if (req.type == type) { thething = req }
	}
	return thething;
}

export function youMustBeThisTall(ns: NS, reqs: PlayerRequirement[]): boolean {
	let req = getThisReq(reqs, "skills") as SkillRequirement;
	if (req.type == "skills") {
		return Object.keys(req.skills).every(skillName => {
			return (req.skills[skillName as keyof Skills] ?? 0) <= Math.trunc(ns.getPlayer().skills[skillName as keyof Skills] * 1.2)
		});
	} else { return false; }
}

export async function joinThisFaction(ns: NS, faction: string, focus: boolean): Promise<void> {
	if (!ns.getPlayer().factions.includes(faction) && !ns.singularity.checkFactionInvitations().includes(faction)) {
		const facreqs = ns.singularity.getFactionInviteRequirements(faction);
		let unmet = [];
		for (const req of facreqs) { if (!reqCheck(ns, req)) { unmet.push(req); } }
		let passesmuster = true;
		if (hasThisReq(unmet, "numAugmentations")) { passesmuster = false; }
		if (hasThisReq(unmet, "bitNodeN")) { passesmuster = false; }
		if (hasThisReq(unmet, "sourceFile")) { passesmuster = false; }
		if (hasThisReq(unmet, "jobTitle")) { passesmuster = false; } //only for now to prevent an issue with the requirement being unhandled
		if (hasThisReq(unmet, "skills") && !youMustBeThisTall(ns, unmet)) { passesmuster = false; }
		if (passesmuster) { for (const req of unmet) { await reqSolver(ns, req, focus); } }
	}
	if (ns.singularity.checkFactionInvitations().includes(faction)) { ns.singularity.joinFaction(faction); }
}

export function getFactionUnmetReqs(ns: NS, faction: string): PlayerRequirement[] {
	let unmet = [];
	if (!ns.getPlayer().factions.includes(faction) && !ns.singularity.checkFactionInvitations().includes(faction)) {
		const facreqs = ns.singularity.getFactionInviteRequirements(faction);
		for (const req of facreqs) { if (!reqCheck(ns, req)) { unmet.push(req); } }
	}
	return unmet;
}

export function formatTimeString(ns: NS, milliseconds: number): string {
	return ns.tFormat(milliseconds, false).replace(/ days?/, 'd').replace(/ hours?/, 'h').replace(/ minutes?/, 'm').replace(/ seconds?/,
		's').replaceAll(', ', '') + " " + Math.floor(milliseconds % 1000).toString().padStart(3, '0') + 'ms';
}

export function formatLoadingBar(percent: number, length: number): string {
	let finalstring = "";
	let sublength = length - 2;
	let percentlength = Math.floor(sublength * percent);
	while (finalstring.length < percentlength) { finalstring += "|"; }
	while (finalstring.length < sublength) { finalstring += "-"; }
	return "[" + finalstring + "]";
}

export function howTheTurnsTable(ns: NS, headerKey: any, tableData: any[]): ReactElement {
	let headerReact = [];
	let headers = Object.keys(headerKey);
	for (const header of headers) { headerReact.push(React.createElement('th', { style: { "padding": "5px", "textDecoration": "underline" } }, header)); }
	let reactTable = [React.createElement('tr', {}, headerReact)];
	for (const row of tableData) {
		let rowdata = [];
		for (let i = 0; i < headers.length; i++) {
			let celldata = row[headers[i]];
			let format = Object.values(headerKey)[i] as string;
			if (format == 'number') {
				rowdata.push(React.createElement('td', { style: { "padding": "5px", "textAlign": "right" } }, ns.formatNumber(celldata)));
			} else if (format == 'integer') {
				rowdata.push(React.createElement('td', { style: { "padding": "5px", "textAlign": "right" } }, ns.formatNumber(celldata, undefined, undefined, true)));
			} else if (format == 'duration') {
				rowdata.push(React.createElement('td', { style: { "padding": "5px", "textAlign": "right" } }, formatTimeString(ns, celldata)));
			} else if (format.includes('progress')) {
				rowdata.push(React.createElement('td', { style: { "padding": "5px", "textAlign": "center" } }, formatLoadingBar(celldata, parseInt(format.split(',')[1]))));
			} else if (i == 0) {
				rowdata.push(React.createElement('td', { style: { "padding": "5px", "textAlign": "right" } }, celldata));
			} else {
				rowdata.push(React.createElement('td', { style: { "padding": "5px", "textAlign": "center" } }, celldata));
			}
		}
		reactTable.push(React.createElement('tr', {}, rowdata));
	}
	return React.createElement('tbody', {}, reactTable);
}

export function thereCanBeOnlyOne(ns: NS): void {
	for (const process of ns.ps()) { if (process.pid != ns.pid && process.filename == ns.getScriptName()) { ns.kill(process.pid); } }
}

export function bitnodeAccess(ns: NS, node: number, level: number): boolean {
	return (ns.getResetInfo().currentNode == node) || ((ns.getResetInfo().ownedSF.get(node) || 0) >= level);
}

export function toFile(ns: NS, filename: string, filedata: any): void { ns.write(filename, JSON.stringify(filedata), "w"); }

export function fromFile(ns: NS, filename: string): any { return JSON.parse(ns.read(filename)); }

export async function isSleeveAug(ns: NS, augment: string): Promise<boolean> {
	const desiredstats: (keyof Multipliers)[] = ["strength", "strength_exp", "agility", "agility_exp", "defense", "defense_exp", "dexterity", "dexterity_exp",
		"crime_money", "crime_success", "company_rep", "faction_rep"];
	const augstats = await wrapNS(ns).singularity.getAugmentationStatsD(augment);
	return desiredstats.some(stat => augstats[stat] > 1);
}

export async function getNextSleeveAug(ns: NS, sleeve: number): Promise<AugmentPair> {
	//let sleeveaugs = await asyncFilter(await wrapNS(ns).sleeve.getSleevePurchasableAugsD(sleeve), async aug => await isSleeveAug(ns, aug.name));
	//frankly, if sleeves are gonna be imitating the player, just buy all augments
	let sleeveaugs = await wrapNS(ns).sleeve.getSleevePurchasableAugsD(sleeve);
	return sleeveaugs.sort((a, b) => { return a.cost - b.cost; })[0];
}

/*
type Worker = {
	id: number,
	//setTask: "idle" | "crime" | "company" | "faction",
	object: Player | SleevePerson
}

export async function createWorkerList(ns: NS): Promise<Worker[]> {
	let workerlist = [{
		id: -1,
		object: ns.getPlayer() as Player | SleevePerson
	}];
	const sleevecount = await wrapNS(ns).sleeve.getNumSleevesD();
	for (let i = 0; i < sleevecount; i++) {
		workerlist.push({
			id: i,
			object: await wrapNS(ns).sleeve.getSleeveD(i)
		});
	}
	return workerlist;
}

export async function setCrimeIdleTypeless(ns: NS, worker: Worker, focus: boolean): Promise<void> {
	const crimetask = getStabbin(ns, worker.object) ? "Homicide" : "Mug";
	if (worker.id > -1) { await wrapNS(ns).sleeve.setToCommitCrimeD(worker.id, crimetask); }
	else { await wrapNS(ns).singularity.commitCrimeD(crimetask, focus); }
}

export async function setCompanyWorkTypeless(ns: NS, worker: Worker, focus: boolean): Promise<void> {
}
*/

export async function handleSleeveClasses(ns: NS, sleeve: number, playertask: any): Promise<void> {
	const combatstats = ["str", "def", "dex", "agi"];
	let sleevelocation = (await wrapNS(ns).sleeve.getSleeveD(sleeve)).city;
	if (combatstats.includes(playertask.classType)) {
		if (sleevelocation != "Sector-12") { await wrapNS(ns).sleeve.travelD(sleeve, "Sector-12"); }
		await wrapNS(ns).sleeve.setToGymWorkoutD(sleeve, "Powerhouse Gym", playertask.classType);
	} else {
		if (sleevelocation != "Volhaven") { await wrapNS(ns).sleeve.travelD(sleeve, "Volhaven"); }
		await wrapNS(ns).sleeve.setToUniversityCourseD(sleeve, "ZB Institute of Technology", playertask.classType);
	}
}
