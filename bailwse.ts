import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.scriptKill("stockwatcher.js", "home");
	const stocknames = ns.stock.getSymbols();
	for (const stocksym of stocknames) {
		while (ns.getServerMoneyAvailable("home") < 200000) { await ns.sleep(10000); }
		ns.stock.sellStock(stocksym, ns.stock.getPosition(stocksym)[0]);
		ns.stock.sellShort(stocksym, ns.stock.getPosition(stocksym)[2]);
	}
}