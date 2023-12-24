import { NS } from "@ns";
import { masterLister } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	let contractservers = masterLister(ns).filter(serv => ns.ls(serv, ".cct").length > 0);
	for (const server of contractservers) {
		let contractlist = ns.ls(server, ".cct");
		for (const contract of contractlist) {
			ns.tprint(server + " " + contract + " " + ns.codingcontract.getContractType(contract, server));
		}
	}
}