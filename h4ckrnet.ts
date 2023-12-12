import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	const payofftime = 10 * 60; //the seconds in ten minutes
	const hnserv = ns.hacknet.hashCost("Sell for Money") < Infinity;
	ns.disableLog('ALL');
	//ns.tail();
	//let formsexe = ns.fileExists("Formulas.exe", "home");
	let running = true;
	while (running) {
		let costarray = [];
		let newcost = Infinity;
		let payoffprod = 0;
		for (let i = 0; i < ns.hacknet.numNodes(); i++) { payoffprod = payoffprod + ns.hacknet.getNodeStats(i).production; }
		payoffprod = payoffprod * payofftime;
		if (hnserv) { payoffprod = payoffprod * (1000000 / ns.hacknet.hashCost("Sell for Money")); }
		if (ns.hacknet.numNodes() < ns.hacknet.maxNumNodes()) {
			newcost = ns.hacknet.getPurchaseNodeCost();
			if (newcost > payoffprod && ns.hacknet.numNodes() > 0) { newcost = Infinity; }
		}
		for (let i = 0; i < ns.hacknet.numNodes(); i++) {
			let upgarray = [0, 0, 0, 0];
			upgarray[0] = ns.hacknet.getLevelUpgradeCost(i);
			if (upgarray[0] > payoffprod) { upgarray[0] = Infinity; }
			upgarray[1] = ns.hacknet.getRamUpgradeCost(i);
			if (upgarray[1] > payoffprod) { upgarray[1] = Infinity; }
			upgarray[2] = ns.hacknet.getCoreUpgradeCost(i);
			if (upgarray[2] > payoffprod) { upgarray[2] = Infinity; }
			upgarray[3] = ns.hacknet.getCacheUpgradeCost(i);
			if (upgarray[3] > payoffprod) { upgarray[3] = Infinity; }
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
		if (nextdex[2] == Infinity) { running = false; }
		else {
			while (ns.getServerMoneyAvailable("home") < nextdex[2]) { await ns.sleep(1000); }
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
		}
	}
}