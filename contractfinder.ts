import { NS } from "@ns";
import { masterLister } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	let firstcontract = masterLister(ns).find(serv => ns.ls(serv, ".cct").length > 0);
	if (firstcontract != undefined) {
		let contract = ns.ls(firstcontract, ".cct")[0];
		ns.tprint(ns.codingcontract.getContractType(contract, firstcontract));
		ns.tprint(ns.codingcontract.getDescription(contract, firstcontract));
		ns.tprint(ns.codingcontract.getData(contract, firstcontract));
	}
}