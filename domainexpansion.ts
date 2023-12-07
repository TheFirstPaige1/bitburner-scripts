import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	let ramlimit = Math.trunc(ns.getServerMaxRam("home") / 2);
	let pservlimit = Math.min(ramlimit, ns.getPurchasedServerMaxRam());
	let corelimit = ns.getServer("home").cpuCores;
	let serverlimit = ns.getPurchasedServerLimit();
	let hacknetlimit = ns.hacknet.maxNumNodes();
	if (hacknetlimit == Infinity) { hacknetlimit = serverlimit; }
	while (true) {
		if (ns.singularity.upgradeHomeRam()) {
			ramlimit = Math.trunc(ns.getServerMaxRam("home") / 2);
			pservlimit = Math.min(ramlimit, ns.getPurchasedServerMaxRam());
		}
		if (ns.singularity.upgradeHomeCores()) { corelimit = ns.getServer("home").cpuCores; }
		let pservcost = ns.getPurchasedServerCost(2);
		if (ns.getPurchasedServers().length >= serverlimit) { pservcost = Infinity; }
		let hacknetcost = ns.hacknet.getPurchaseNodeCost();
		if (ns.hacknet.numNodes() >= hacknetlimit) { hacknetcost = Infinity; }
		let nextpserv = ns.getPurchasedServers().sort((a, b) => { return ns.getServerMaxRam(a) - ns.getServerMaxRam(b); })[0];
		let nextpservcost = ns.getPurchasedServerUpgradeCost(nextpserv, ns.getServerMaxRam(nextpserv) * 2);
		if (ns.getServerMaxRam(nextpserv) >= pservlimit) { nextpservcost = Infinity; }
		let hacknets = [];
		for (let i = 0; i < ns.hacknet.numNodes(); i++) { hacknets.push(ns.hacknet.getNodeStats(i)); }
		let nexthacklevel = hacknets.indexOf(hacknets.sort((a, b) => { return a.level - b.level; })[0]);
		let nexthacklevelcost = ns.hacknet.getLevelUpgradeCost(nexthacklevel);
		let nexthackram = hacknets.indexOf(hacknets.sort((a, b) => { return a.ram - b.ram; })[0]);
		let nexthackramcost = ns.hacknet.getRamUpgradeCost(nexthackram);
		if (ns.hacknet.getNodeStats(nexthackram).ram >= ramlimit) { nexthackramcost = Infinity; }
		let nexthackcore = hacknets.indexOf(hacknets.sort((a, b) => { return a.cores - b.cores; })[0]);
		let nexthackcorecost = ns.hacknet.getCoreUpgradeCost(nexthackcore);
		if (ns.hacknet.getNodeStats(nexthackcore).cores >= corelimit) { nexthackcorecost = Infinity; }
		let nexthackcache = hacknets.indexOf(hacknets.sort((a, b) => {
			if (a.cache != undefined && b.cache != undefined) { return a.cache - b.cache; }
			else { return 0; }
		})[0]);
		let nexthackcachecost = ns.hacknet.getCacheUpgradeCost(nexthackcache);
		let nextcost = Infinity;
		let nextpurchase = -1;
		if (nextcost > pservcost) {
			nextcost = pservcost;
			nextpurchase = 0;
		}
		if (nextcost > hacknetcost) {
			nextcost = hacknetcost;
			nextpurchase = 1;
		}
		if (nextcost > nextpservcost) {
			nextcost = nextpservcost;
			nextpurchase = 2;
		}
		if (nextcost > nexthacklevelcost) {
			nextcost = nexthacklevelcost;
			nextpurchase = 3;
		}
		if (nextcost > nexthackramcost) {
			nextcost = nexthackramcost;
			nextpurchase = 4;
		}
		if (nextcost > nexthackcorecost) {
			nextcost = nexthackcorecost;
			nextpurchase = 5;
		}
		if (nextcost > nexthackcachecost) {
			nextcost = nexthackcachecost;
			nextpurchase = 6;
		}
	}
}