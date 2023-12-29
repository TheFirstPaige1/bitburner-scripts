import { NS } from "@ns";
import { masterLister } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	if (ns.args.length > 1) {
		let server = ns.args[0] as string;
		let contract = ns.args[1] as string;
		ns.tprint(ns.codingcontract.getContractType(contract, server));
		ns.tprint(ns.codingcontract.getDescription(contract, server));
		ns.tprint(ns.codingcontract.getData(contract, server));
		ns.tprint(ns.codingcontract.getNumTriesRemaining(contract, server));
	} else {
		let contractservers = masterLister(ns).filter(serv => ns.ls(serv, ".cct").length > 0);
		for (const server of contractservers) {
			let contractlist = ns.ls(server, ".cct");
			for (const contract of contractlist) {
				ns.tprint(server + " " + contract + " " + ns.codingcontract.getContractType(contract, server));
			}
		}
	}
}