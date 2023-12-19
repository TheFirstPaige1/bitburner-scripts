import { NS } from "@ns";
import * as BitLib from "./bitlib";
export async function main(ns: NS): Promise<void> {
	const targetcost = 25000000;
	BitLib.quietTheBabblingThrong(ns);
	if (BitLib.hasFocusPenalty(ns)) { ns.tail(); }
	let running = true;
	while (running) {
		let costarray = [];
		let newcost = Infinity;
		if (ns.hacknet.numNodes() < ns.hacknet.maxNumNodes()) {
			newcost = ns.hacknet.getPurchaseNodeCost();
			if (newcost > targetcost && ns.hacknet.numNodes() > 0) { newcost = Infinity; }
		}
		for (let i = 0; i < ns.hacknet.numNodes(); i++) {
			let upgarray = [0, 0, 0, 0];
			upgarray[0] = ns.hacknet.getLevelUpgradeCost(i);
			if (upgarray[0] > targetcost) { upgarray[0] = Infinity; }
			upgarray[1] = ns.hacknet.getRamUpgradeCost(i);
			if (upgarray[1] > targetcost) { upgarray[1] = Infinity; }
			upgarray[2] = ns.hacknet.getCoreUpgradeCost(i);
			if (upgarray[2] > targetcost) { upgarray[2] = Infinity; }
			upgarray[3] = ns.hacknet.getCacheUpgradeCost(i);
			if (upgarray[3] > targetcost) { upgarray[3] = Infinity; }
			costarray.push(upgarray);
		}
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
			while (ns.getServerMoneyAvailable("home") < nextdex[2]) {
				while (ns.hacknet.spendHashes("Sell for Money")) { await ns.sleep(1); }
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
		}
	}
}