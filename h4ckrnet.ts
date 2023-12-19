import { NS } from "@ns";
import { quietTheBabblingThrong, hasFocusPenalty } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	const h4ck = ns.hacknet;
	quietTheBabblingThrong(ns);
	if (hasFocusPenalty(ns)) { ns.tail(); }
	while (true) {
		let targetcost = Math.trunc(ns.getServerMoneyAvailable("home") * 0.25);
		ns.print("spending allotment is " + ns.formatNumber(targetcost));
		let costarray = [];
		let newcost = Infinity;
		if (h4ck.numNodes() < h4ck.maxNumNodes()) {
			newcost = h4ck.getPurchaseNodeCost();
			if (newcost > targetcost && h4ck.numNodes() > 0) { newcost = Infinity; }
		}
		for (let i = 0; i < h4ck.numNodes(); i++) {
			let upgarray = [0, 0, 0, 0];
			upgarray[0] = h4ck.getLevelUpgradeCost(i);
			if (upgarray[0] > targetcost) { upgarray[0] = Infinity; }
			upgarray[1] = h4ck.getRamUpgradeCost(i);
			if (upgarray[1] > targetcost) { upgarray[1] = Infinity; }
			upgarray[2] = h4ck.getCoreUpgradeCost(i);
			if (upgarray[2] > targetcost) { upgarray[2] = Infinity; }
			upgarray[3] = h4ck.getCacheUpgradeCost(i);
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
		if (nextdex[2] == Infinity) {
			if (h4ck.numHashes() > Math.trunc(h4ck.hashCapacity() * 0.75)) {
				while (h4ck.numHashes() > Math.trunc(h4ck.hashCapacity() * 0.5)) {
					h4ck.spendHashes("Sell for Money");
				}
			} else { await ns.sleep(10000); }
		} else {
			while (ns.getServerMoneyAvailable("home") < nextdex[2]) {
				if (h4ck.numHashes() > Math.trunc(h4ck.hashCapacity() * 0.75)) {
					while (h4ck.numHashes() > Math.trunc(h4ck.hashCapacity() * 0.5)) {
						h4ck.spendHashes("Sell for Money");
					}
				} else { await ns.sleep(1000); }
			}
			switch (nextdex[1]) {
				case -1:
					h4ck.purchaseNode();
					ns.print("Expanding Hacknet");
					break;
				case 0:
					h4ck.upgradeLevel(nextdex[0]);
					ns.print("Upgrading " + h4ck.getNodeStats(nextdex[0]).name + " level");
					break;
				case 1:
					h4ck.upgradeRam(nextdex[0]);
					ns.print("Upgrading " + h4ck.getNodeStats(nextdex[0]).name + " RAM");
					break;
				case 2:
					h4ck.upgradeCore(nextdex[0]);
					ns.print("Upgrading " + h4ck.getNodeStats(nextdex[0]).name + " core");
					break;
				case 3:
					h4ck.upgradeCache(nextdex[0]);
					ns.print("Upgrading " + h4ck.getNodeStats(nextdex[0]).name + " cache");
			}
		}
	}
}