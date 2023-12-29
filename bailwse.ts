import { NS } from "@ns";
import { bitnodeAccess } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	ns.scriptKill("stockwatcher.js", "home");
	if (ns.stock.hasWSEAccount() && ns.stock.hasTIXAPIAccess()) {
		const stocknames = ns.stock.getSymbols();
		for (const stocksym of stocknames) {
			while (ns.getServerMoneyAvailable("home") < 200000) { await ns.sleep(10000); }
			ns.stock.sellStock(stocksym, ns.stock.getPosition(stocksym)[0]);
			if (bitnodeAccess(ns, 8, 2)) { ns.stock.sellShort(stocksym, ns.stock.getPosition(stocksym)[2]); }
		}
	}
}