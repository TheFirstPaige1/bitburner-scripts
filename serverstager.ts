import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	ns.tail();
	const limit = 1 + Math.min(ns.args[0] as number, ns.getPurchasedServerMaxRam());
	let ram = 2;
	while (ram < limit) {
		for (let i = 0; i < ns.getPurchasedServerLimit(); i++) {
			let servername = "pserv-" + i;
			if (ns.serverExists(servername)) {
				if (ns.getServerMaxRam(servername) < ram) {
					ns.print("Next cost is $" + ns.formatNumber(ns.getPurchasedServerUpgradeCost(servername, ram)));
					while (ns.getServerMoneyAvailable("home") < ns.getPurchasedServerUpgradeCost(servername, ram)) { await ns.sleep(10000); }
					ns.upgradePurchasedServer(servername, ram);
					ns.print("Upgraded server " + servername + " with " + ram + " RAM");
					if (ram > 7) {
						ns.killall(servername);
						ns.exec("manshare.js", servername, Math.trunc(ram / 8));
						ns.print("Private server share power: " + ns.getSharePower());
					}
				}
			} else {
				ns.print("Next cost is $" + ns.formatNumber(ns.getPurchasedServerCost(ram)));
				while (ns.getServerMoneyAvailable("home") < ns.getPurchasedServerCost(ram)) { await ns.sleep(10000); }
				ns.purchaseServer(servername, ram);
				ns.print("Purchased server " + servername + " with " + ram + " RAM");
				ns.scp("manshare.js", servername);
			}
		}
		ram = ram * 2;
	}
	ns.print("Private server share power: " + ns.getSharePower());
}