import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.scriptKill("stockwatcher.js", "home");
	const stocknames = ns.stock.getSymbols();
	for (let i = 0; i < stocknames.length; i++) {
		let stockposition = ns.stock.getPosition(stocknames[i]);
		ns.stock.sellStock(stocknames[i], stockposition[0]);
	}
}