import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	ns.tail();
	let running = true;
	while (running == true) {
		let cdex = 0;
		let clevelnode = 0;
		let cramnode = 0;
		let ccorenode = 0;
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
		ns.print("Next cost is $" + ns.formatNumber(ccost));
		while (ns.getServerMoneyAvailable("home") < ccost) {
			await ns.sleep(1000);
		}
		switch (cdex) {
			case 0:
				ns.hacknet.purchaseNode();
				ns.print("Buying Hacknet Node at cost $" + ns.formatNumber(ccost));
				break;
			case 1:
				ns.hacknet.upgradeLevel(clevelnode);
				ns.print("Upgrading Hacknet Node " + clevelnode + " level");
				break;
			case 2:
				ns.hacknet.upgradeRam(cramnode);
				ns.print("Upgrading Hacknet Node " + cramnode + " RAM");
				break;
			case 3:
				ns.hacknet.upgradeCore(ccorenode);
				ns.print("Upgrading Hacknet Node " + ccorenode + " core");
				break;
		}
		if (ccost == Infinity) {
			running = false;
		}
	}
	ns.closeTail();
}