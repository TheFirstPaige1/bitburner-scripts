import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	for (const fac of ns.singularity.checkFactionInvitations()) { ns.singularity.joinFaction(fac); }
	ns.scriptKill("stockwatcher.js", "home");
	if (ns.stock.hasWSEAccount() && ns.stock.hasTIXAPIAccess()) {
		const stocknames = ns.stock.getSymbols();
		for (const stocksym of stocknames) {
			while (ns.getServerMoneyAvailable("home") < 200000) { await ns.sleep(10000); }
			ns.stock.sellStock(stocksym, ns.stock.getPosition(stocksym)[0]);
			try { ns.stock.sellShort(stocksym, ns.stock.getPosition(stocksym)[2]); } catch { }
		}
	}
	const excludedfacs = ["Bladeburners", "Church of the Machine God", "Shadows of Anarchy"];
	let factions = ns.getPlayer().factions;
	factions = factions.filter(fac => !excludedfacs.includes(fac));
	if (ns.gang.inGang()) { factions = factions.filter(fac => ns.gang.getGangInformation().faction != fac); }
	factions = factions.sort((a, b) => { return ns.singularity.getFactionRep(b) - ns.singularity.getFactionRep(a); })
	while (ns.singularity.purchaseAugmentation(factions[0], "NeuroFlux Governor")) { await ns.sleep(10); }
	ns.singularity.installAugmentations("setup.js");
}