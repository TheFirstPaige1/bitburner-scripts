import { NS } from "@ns";
import { bitnodeAccess, getNextSleeveAug, getStabbin, handleSleeveClasses, thereCanBeOnlyOne, wrapNS } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	thereCanBeOnlyOne(ns);
	const wsleeve = wrapNS(ns).sleeve;
	const sleeveaccess = bitnodeAccess(ns, 10, 1);
	while (sleeveaccess) {
		let sleevecount = await wsleeve.getNumSleevesD();
		let playertask = ns.singularity.getCurrentWork();
		let allsleeping = true;
		for (let i = 0; i < sleevecount; i++) {
			const thinga = await wsleeve.getSleeveD(i);
			if (thinga.shock > 0) { await wsleeve.setToShockRecoveryD(i); }
			else if (thinga.sync < 100) { await wsleeve.setToSynchronizeD(i); }
			else {
				allsleeping = false;
				let nextaug = await getNextSleeveAug(ns, i);
				if (nextaug != undefined && nextaug.cost < ns.getServerMoneyAvailable("home")) { await wsleeve.purchaseSleeveAugD(i, nextaug.name); }
				if (playertask != null) {
					switch (playertask.type) {
						case "CRIME":
							await wsleeve.setToCommitCrimeD(i, (getStabbin(ns, thinga)));
							break;
						case "FACTION":
							await wsleeve.setToFactionWorkD(i, playertask.factionName, playertask.factionWorkType);
							break;
						case "CLASS":
							await handleSleeveClasses(ns, i, playertask);
							break;
						case "COMPANY":
							await wsleeve.setToCompanyWorkD(i, playertask.companyName);
							break;
						default: await wsleeve.setToCommitCrimeD(i, (getStabbin(ns, thinga)));
					}
					await ns.sleep(10000);
					await wsleeve.setToIdleD(i);
				} else {
					await wsleeve.setToCommitCrimeD(i, (getStabbin(ns, thinga)));
					await ns.sleep(10000);
				}
			}
		}
		if (allsleeping) { await ns.sleep(10000); }
	}
}