import { NS } from "@ns";
import { gangNames } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	while (!ns.gang.createGang("The Black Hand") && !ns.gang.inGang()) { await ns.sleep(60000); }
	if (ns.gang.canRecruitMember()) { for (const member of gangNames) { ns.gang.recruitMember(member); } }
}