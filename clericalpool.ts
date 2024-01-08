import { NS } from "@ns";
import { getNextSleeveAug, getStabbin, wrapNS } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	const wsleeve = wrapNS(ns).sleeve;
	const sleevecount = await wsleeve.getNumSleevesD();
	for (let i = 0; i < sleevecount; i++) {
		const thinga = await wsleeve.getSleeveD(i);
		if (thinga.shock > 0) { await wsleeve.setToShockRecoveryD(i); }
		else if (thinga.sync < 100) { await wsleeve.setToSynchronizeD(i); }
		else {
			let nextaug = await getNextSleeveAug(ns, i);
			if (nextaug.cost < ns.getServerMoneyAvailable("home")) { await wsleeve.purchaseSleeveAugD(i, nextaug.name); }
			let sleevetask = await wsleeve.getTaskD(i);
			if (sleevetask != null) {
			} else { await wsleeve.setToCommitCrimeD(i, (getStabbin(ns, thinga) ? "Homicide" : "Mug")); }
		}
	}
}