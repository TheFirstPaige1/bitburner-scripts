import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	while (ns.corporation.getCorporation().issuedShares > 0) {
		let sharestobuy = Math.trunc((ns.getServerMoneyAvailable("home") / ns.corporation.getCorporation().sharePrice) * 0.89);
		ns.print("buying " + ns.formatNumber(sharestobuy) + " shares");
		ns.print(ns.formatNumber(ns.corporation.getCorporation().issuedShares) + " shares left to buy");
		ns.corporation.buyBackShares(sharestobuy);
		await ns.sleep(60000);
	}
}