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
	//let formsexe = ns.fileExists("Formulas.exe", "home");
	while (running) {
		let costarray = [];
		let newcost = Infinity;
		if (ns.hacknet.numNodes() < ns.hacknet.maxNumNodes()) {
			newcost = ns.hacknet.getPurchaseNodeCost();
		}
		for (let i = 0; i < ns.hacknet.numNodes(); i++) {
			let upgarray = [0, 0, 0, 0];
			upgarray[0] = ns.hacknet.getLevelUpgradeCost(i);
			upgarray[1] = ns.hacknet.getRamUpgradeCost(i);
			upgarray[2] = ns.hacknet.getCoreUpgradeCost(i);
			if (hackservs) {
				upgarray[3] = ns.hacknet.getCacheUpgradeCost(i);
			} else {
				upgarray[3] = Infinity;
			}
			costarray.push(upgarray);
		}
		//if (formsexe) {
			//iterate over the array to adjust costs for effectiveness of income increase
			//later, when can be assed
		//}
		let nextdex = [-1, -1, newcost];
		for (let i = 0; i < costarray.length; i++) {
			let hnode = costarray[i];
			for (let j = 0; j < hnode.length; j++) {
				if (hnode[j] < nextdex[2]) { nextdex = [i, j, hnode[j]]; }
			}
		}
		ns.print("Next cost is $" + ns.formatNumber(nextdex[2]));
		while (ns.getServerMoneyAvailable("home") < nextdex[2]) {
			if (hackservs && ns.hacknet.numHashes() > ns.hacknet.hashCost("Sell for Money")) {
				ns.hacknet.spendHashes("Sell for Money");
			}
			await ns.sleep(1000);
		}
		switch (nextdex[1]) {
			case -1:
				ns.hacknet.purchaseNode();
				ns.print("Expanding Hacknet");
				break;
			case 0:
				ns.hacknet.upgradeLevel(nextdex[0]);
				ns.print("Upgrading " + ns.hacknet.getNodeStats(nextdex[0]).name + " level");
				break;
			case 1:
				ns.hacknet.upgradeRam(nextdex[0]);
				ns.print("Upgrading " + ns.hacknet.getNodeStats(nextdex[0]).name + " RAM");
				break;
			case 2:
				ns.hacknet.upgradeCore(nextdex[0]);
				ns.print("Upgrading " + ns.hacknet.getNodeStats(nextdex[0]).name + " core");
				break;
			case 3:
				ns.hacknet.upgradeCache(nextdex[0]);
				ns.print("Upgrading " + ns.hacknet.getNodeStats(nextdex[0]).name + " cache");
		}
		if (nextdex[2] == Infinity) { running = false; }
	}
}