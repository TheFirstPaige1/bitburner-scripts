import { NS } from "@ns";
import { gangNames, thereCanBeOnlyOne } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	thereCanBeOnlyOne(ns);
	while (!ns.gang.createGang("The Black Hand") && !ns.gang.inGang()) { await ns.sleep(60000); }
	while (true) {
		if (ns.gang.canRecruitMember()) { for (const member of gangNames) { ns.gang.recruitMember(member); } }
		let ganglist = ns.gang.getMemberNames();
		let ganginfo = ns.gang.getGangInformation();
		for (const member of ganglist) {
			let meminfo = ns.gang.getMemberInformation(member);
			let ascendresult = ns.gang.getAscensionResult(member);
			if (ascendresult != undefined && ascendresult.hack >= 2) {
				ns.gang.ascendMember(member);
				meminfo = ns.gang.getMemberInformation(member);
				ascendresult = ns.gang.getAscensionResult(member);
			}
			let settask = meminfo.task;
			if (ganginfo.wantedPenalty > 1 && ganginfo.wantedLevel > 1) { settask = "Ethical Hacking"; }
			else if (meminfo.hack_asc_mult < 4) { settask = "Train Hacking"; }
			else if (ganginfo.respectForNextRecruit < Infinity) { settask = "Cyberterrorism" }
			else { settask = "Money Laundering"; }
			if (meminfo.task != settask) { ns.gang.setMemberTask(member, settask); }
		}
		await ns.gang.nextUpdate();
	}
}