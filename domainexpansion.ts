import { NS } from "@ns";
import { hasFocusPenalty, getHacknetIndex } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('sleep');
	ns.disableLog('getServerMaxRam');
	if (hasFocusPenalty(ns)) { ns.tail(); }
	let ramlimit = ns.getServerMaxRam("home");
	let pservlimit = Math.min(ramlimit, ns.getPurchasedServerMaxRam());
	let serverlimit = ns.getPurchasedServerLimit();
	let hacknetlimit = ns.hacknet.maxNumNodes();
	if (hacknetlimit == Infinity) { hacknetlimit = serverlimit; }
	while (true) {
		if (ns.singularity.upgradeHomeRam()) {
			ramlimit = Math.trunc(ns.getServerMaxRam("home") / 2);
			pservlimit = Math.min(ramlimit, ns.getPurchasedServerMaxRam());
		}
		ns.singularity.upgradeHomeCores();
		let pservcost = ns.getPurchasedServerCost(2);
		if (ns.getPurchasedServers().length >= serverlimit) { pservcost = Infinity; }
		let hacknetcost = ns.hacknet.getPurchaseNodeCost();
		if (ns.hacknet.numNodes() >= hacknetlimit) { hacknetcost = Infinity; }
		let nextpserv = ns.getPurchasedServers().sort((a, b) => { return ns.getServerMaxRam(a) - ns.getServerMaxRam(b); })[0];
		let nextpservcost = Infinity;
		if (nextpserv != undefined) { nextpservcost = ns.getPurchasedServerUpgradeCost(nextpserv, ns.getServerMaxRam(nextpserv) * 2); }
		if (nextpserv != undefined && ns.getServerMaxRam(nextpserv) >= pservlimit) { nextpservcost = Infinity; }
		let hacknets = [];
		let nexthacklevel = 0;
		let nexthacklevelcost = Infinity;
		let nexthackram = 0;
		let nexthackramcost = Infinity;
		let nexthackcore = 0;
		let nexthackcorecost = Infinity;
		let nexthackcache = 0;
		let nexthackcachecost = Infinity;
		if (ns.hacknet.numNodes() > 0) {
			for (let i = 0; i < ns.hacknet.numNodes(); i++) { hacknets.push(ns.hacknet.getNodeStats(i)); }
			nexthacklevel = getHacknetIndex(ns, hacknets.sort((a, b) => { return a.level - b.level; })[0].name);
			nexthacklevelcost = ns.hacknet.getLevelUpgradeCost(nexthacklevel);
			nexthackram = getHacknetIndex(ns, hacknets.sort((a, b) => { return a.ram - b.ram; })[0].name);
			nexthackramcost = ns.hacknet.getRamUpgradeCost(nexthackram);
			if (ns.hacknet.getNodeStats(nexthackram).ram >= ramlimit) { nexthackramcost = Infinity; }
			nexthackcore = getHacknetIndex(ns, hacknets.sort((a, b) => { return a.cores - b.cores; })[0].name);
			nexthackcorecost = ns.hacknet.getCoreUpgradeCost(nexthackcore);
			nexthackcache = getHacknetIndex(ns, hacknets.sort((a, b) => {
				if (a.cache != undefined && b.cache != undefined) { return a.cache - b.cache; }
				else { return 0; }
			})[0].name);
			nexthackcachecost = ns.hacknet.getCacheUpgradeCost(nexthackcache);
		}
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
		ns.print("next cost is: " + ns.formatNumber(nextcost));
		if (nextcost != Infinity) {
			while (ns.getServerMoneyAvailable("home") < nextcost) {
				if (ns.singularity.upgradeHomeRam()) {
					ramlimit = Math.trunc(ns.getServerMaxRam("home") / 2);
					pservlimit = Math.min(ramlimit, ns.getPurchasedServerMaxRam());
				}
				ns.singularity.upgradeHomeCores();
				if (ns.hacknet.numHashes() > ns.hacknet.hashCost("Sell for Money")) { ns.hacknet.spendHashes("Sell for Money"); }
				await ns.sleep(6000);
			}
			switch (nextpurchase) {
				case 0:
					let servname = "pserv-" + ns.getPurchasedServers().length;
					ns.purchaseServer(servname, 2);
					ns.scp("manshare.js", servname, "home");
					break;
				case 1:
					ns.hacknet.purchaseNode();
					break;
				case 2:
					let ram = ns.getServerMaxRam(nextpserv) * 2;
					ns.upgradePurchasedServer(nextpserv, ram);
					if (ram > 7) {
						ns.killall(nextpserv);
						ns.exec("manshare.js", nextpserv, Math.trunc(ram / 8));
					}
					break;
				case 3:
					ns.hacknet.upgradeLevel(nexthacklevel);
					break;
				case 4:
					ns.hacknet.upgradeRam(nexthackram);
					break;
				case 5:
					ns.hacknet.upgradeCore(nexthackcore);
					break;
				case 6:
					ns.hacknet.upgradeCache(nexthackcache);
			}
		} else {
			if (ns.singularity.upgradeHomeRam()) {
				ramlimit = Math.trunc(ns.getServerMaxRam("home") / 2);
				pservlimit = Math.min(ramlimit, ns.getPurchasedServerMaxRam());
			}
			ns.singularity.upgradeHomeCores();
			await ns.sleep(60000);
		}
	}
}