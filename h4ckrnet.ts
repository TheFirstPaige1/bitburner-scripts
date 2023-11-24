import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	ns.tail();
	let running = true;
	let hackservs = false;
	if (ns.fileExists("sourcefiles.txt", "home")) {
		let bitnodes = JSON.parse(ns.read("sourcefiles.txt"));
		if (bitnodes[0] == 9 || bitnodes[9] > 0) { hackservs = true; }
	}
	while (running == true) {
		let cdex = 0;
		let clevelnode = 0;
		let cramnode = 0;
		let ccorenode = 0;
		let chashnode = 0;
		let ccost = Infinity;
		if (ns.hacknet.numNodes() < ns.hacknet.maxNumNodes()) {
			ccost = ns.hacknet.getPurchaseNodeCost();
			cdex = 0;
		}
		for (let i = 0; i < ns.hacknet.numNodes(); i++) {
			if (ns.hacknet.getLevelUpgradeCost(i) < ccost) {
				ccost = ns.hacknet.getLevelUpgradeCost(i);
				clevelnode = i;
				cdex = 1;
			}
		}
		for (let i = 0; i < ns.hacknet.numNodes(); i++) {
			if (ns.hacknet.getRamUpgradeCost(i) < ccost) {
				ccost = ns.hacknet.getRamUpgradeCost(i);
				cramnode = i;
				cdex = 2;
			}
		}
		for (let i = 0; i < ns.hacknet.numNodes(); i++) {
			if (ns.hacknet.getCoreUpgradeCost(i) < ccost) {
				ccost = ns.hacknet.getCoreUpgradeCost(i);
				ccorenode = i;
				cdex = 3;
			}
		}
		if (hackservs) {
			for (let i = 0; i < ns.hacknet.numNodes(); i++) {
				if (ns.hacknet.getCacheUpgradeCost(i) < ccost) {
					ccost = ns.hacknet.getCacheUpgradeCost(i);
					chashnode = i;
					cdex = 4;
				}
			}
		}
		ns.print("Next cost is $" + ns.formatNumber(ccost));
		while (ns.getServerMoneyAvailable("home") < ccost) {
			if (hackservs && ns.hacknet.numHashes() > ns.hacknet.hashCost("Sell for Money")) {
				ns.hacknet.spendHashes("Sell for Money");
			}
			await ns.sleep(1000);
		}
		switch (cdex) {
			case 0:
				ns.hacknet.purchaseNode();
				ns.print("Expanding Hacknet at cost $" + ns.formatNumber(ccost));
				break;
			case 1:
				ns.hacknet.upgradeLevel(clevelnode);
				ns.print("Upgrading " + ns.hacknet.getNodeStats(clevelnode).name + " level");
				break;
			case 2:
				ns.hacknet.upgradeRam(cramnode);
				ns.print("Upgrading " + ns.hacknet.getNodeStats(cramnode).name + " RAM");
				break;
			case 3:
				ns.hacknet.upgradeCore(ccorenode);
				ns.print("Upgrading " + ns.hacknet.getNodeStats(ccorenode).name + " core");
				break;
			case 4:
				ns.hacknet.upgradeCache(chashnode);
				ns.print("Upgrading " + ns.hacknet.getNodeStats(chashnode).name + " cache");
		}
		if (ccost == Infinity) { running = false; }
	}
}