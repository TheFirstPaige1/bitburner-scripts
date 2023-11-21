import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  ns.tail();
  const limit = 1 + Math.min(ns.args[0] as number, ns.getPurchasedServerMaxRam());
  let ram = 2;
  while (ram < limit) {
    for (let i = 0; i < ns.getPurchasedServerLimit(); i++) {
      if (ns.serverExists("pserv-" + i)) {
        if (ns.getServerMaxRam("pserv-" + i) < ram) {
          ns.print("Next cost is $" + ns.formatNumber(ns.getPurchasedServerUpgradeCost("pserv-" + i, ram)));
          while (ns.getServerMoneyAvailable("home") < ns.getPurchasedServerUpgradeCost("pserv-" + i, ram)) {
            await ns.sleep(1000);
          }
          ns.upgradePurchasedServer("pserv-" + i, ram);
          ns.print("Upgraded server pserv-" + i + " with " + ram + " RAM");
        }
      } else {
        ns.print("Next cost is $" + ns.formatNumber(ns.getPurchasedServerCost(ram)));
        while (ns.getServerMoneyAvailable("home") < ns.getPurchasedServerCost(ram)) {
          await ns.sleep(1000);
        }
        ns.purchaseServer("pserv-" + i, ram);
        ns.print("Purchased server pserv-" + i + " with " + ram + " RAM");
      }
    }
    ram = ram * 2;
  }
}