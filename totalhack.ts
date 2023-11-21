import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	ns.print("populating masterlist...");
	let formsexe = ns.fileExists("Formulas.exe", "home");
	let masterlist = ["home"];
	for (let i = 0; i < masterlist.length; i++) {
		let workinglist = ns.scan(masterlist[i]);
		for (let j = 0; j < workinglist.length; j++) {
			let target = workinglist[j];
			if (!masterlist.includes(target)) {
				let portsbusted = 0
				if (ns.fileExists("BruteSSH.exe", "home")) {
					ns.brutessh(target);
					portsbusted++;
				}
				if (ns.fileExists("FTPCrack.exe", "home")) {
					ns.ftpcrack(target);
					portsbusted++;
				}
				if (ns.fileExists("relaySMTP.exe", "home")) {
					ns.relaysmtp(target);
					portsbusted++;
				}
				if (ns.fileExists("HTTPWorm.exe", "home")) {
					ns.httpworm(target);
					portsbusted++;
				}
				if (ns.fileExists("SQLInject.exe", "home")) {
					ns.sqlinject(target);
					portsbusted++;
				}
				if (ns.getServerNumPortsRequired(target) <= portsbusted) {
					ns.nuke(target);
				}
				if (ns.hasRootAccess(target)) {
					masterlist.push(target);
				}
			}
		}
	}
	masterlist = masterlist.slice(1);
	ns.print("killing old subscripts...");
	for (let i = 0; i < masterlist.length; i++) {
		let target = masterlist[i];
		ns.scriptKill("manhack.js", target);
		ns.scriptKill("mangrow.js", target);
		ns.scriptKill("manweaken.js", target);
	}
	ns.print("populating RAM servers...");
	let ramlist = [];
	for (let i = 0; i < masterlist.length; i++) {
		let target = masterlist[i];
		if (ns.getServerMaxRam(target) > 0) {
			ramlist.push(target);
			ns.scp("manhack.js", target);
			ns.scp("mangrow.js", target);
			ns.scp("manweaken.js", target);
		}
	}
	ns.print("populating hack servers...");
	let targetList = [];
	let moneyList = [];
	let securityList = [];
	for (let i = 0; i < masterlist.length; i++) {
		let target = masterlist[i];
		if (ns.getServerRequiredHackingLevel(target) <= ns.getHackingLevel()) {
			if (ns.getServerMoneyAvailable(target) > 0) {
				targetList.push(target);
				moneyList.push(ns.getServerMaxMoney(target) * 0.75);
				securityList.push(ns.getServerMinSecurityLevel(target) + 5);
			}
		}
	}
	ns.print("creating PID and timer arrays...");
	let pidList = [];
	let timerlist = [];
	for (let i = 0; i < targetList.length; i++) {
		pidList.push(0);
		timerlist.push(0);
	}
	ns.print("beginning main loop");
	let loopcount = 0;
	while (true) {
		for (let i = 0; i < targetList.length; i++) {
			let target = targetList[i];
			if (!ns.isRunning(pidList[i])) {
				let moneyThresh = moneyList[i];
				let securityThresh = securityList[i];
				let mostfreeram = 0;
				let ramserver = ramlist[0];
				for (let m = 0; m < ramlist.length; m++) {
					let freeram = ns.getServerMaxRam(ramlist[m]) - ns.getServerUsedRam(ramlist[m]);
					if (freeram > mostfreeram) {
						mostfreeram = freeram;
						ramserver = ramlist[m];
					}
				}
				let maxthreads = Math.trunc(mostfreeram / 2);
				if (ns.getServerSecurityLevel(target) > securityThresh) {
					let weakengoal = ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target);
					let threadcount = 1;
					while (ns.weakenAnalyze(threadcount) < weakengoal) {
						threadcount++;
					}
					threadcount = Math.min(threadcount, maxthreads);
					if (formsexe) {
						timerlist[i] = ns.formulas.hacking.weakenTime(ns.getServer(target), ns.getPlayer());
						ns.print("weakening " + target + " for " + Math.trunc(timerlist[i]) + "ms");
						ns.print("on " + ramserver + " with " + threadcount + " threads");
					} else {
						ns.print("weakening " + target + " with " + threadcount + " threads on " + ramserver);
					}
					pidList[i] = ns.exec("manweaken.js", ramserver, threadcount, target);
				} else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
					let threadcount = 1;
					if (formsexe) {
						threadcount = ns.formulas.hacking.growThreads(ns.getServer(target), ns.getPlayer(), Infinity);
					} else {
						let growthgoal = ns.getServerMaxMoney(target) / ns.getServerMoneyAvailable(target);
						threadcount = Math.ceil(ns.growthAnalyze(target, growthgoal));
					}
					threadcount = Math.min(maxthreads, threadcount);
					if (formsexe) {
						timerlist[i] = ns.formulas.hacking.growTime(ns.getServer(target), ns.getPlayer());
						ns.print("growing " + target + " for " + Math.trunc(timerlist[i]) + "ms");
						ns.print("on " + ramserver + " with " + threadcount + " threads");
					} else {
						ns.print("growing " + target + " with " + threadcount + " threads on " + ramserver);
					}
					pidList[i] = ns.exec("mangrow.js", ramserver, threadcount, target);
				} else {
					let hackgoal = ns.getServerMaxMoney(target) - moneyThresh;
					let threadcount = Math.ceil(ns.hackAnalyzeThreads(target, hackgoal));
					threadcount = Math.min(threadcount, maxthreads);
					if (formsexe) {
						timerlist[i] = ns.formulas.hacking.hackTime(ns.getServer(target), ns.getPlayer());
						ns.print("hacking " + target + " for " + Math.trunc(timerlist[i]) + "ms");
						ns.print("on " + ramserver + " with " + threadcount + " threads");
					} else {
						ns.print("hacking " + target + " with " + threadcount + " threads on " + ramserver);
					}
					pidList[i] = ns.exec("manhack.js", ramserver, threadcount, target);
				}
			}
			if (ns.getServerMoneyAvailable(target) == 0) {
				ns.print("removing dead server " + target);
				targetList.splice(i, 1);
				pidList.splice(i, 1);
				timerlist.splice(i, 1);
			}
		}
		if (formsexe) {
			let lowestms = Infinity;
			for (let i = 0; i < timerlist.length; i++) {
				if (timerlist[i] < lowestms) {
					lowestms = timerlist[i];
				}
			}
			await ns.sleep(lowestms);
		} else {
			let looping = true;
			while (looping) {
				let pidcount = 0;
				for (let i = 0; i < pidList.length; i++) {
					if (ns.isRunning(pidList[i])) {
						pidcount++;
					}
				}
				if (pidcount == pidList.length) {
					await ns.sleep(5000);
				} else {
					looping = false;
				}
			}
		}
		if (loopcount > 24) {
			ns.print("updating masterlist...");
			masterlist.unshift("home");
			for (let i = 0; i < masterlist.length; i++) {
				let workinglist = ns.scan(masterlist[i]);
				for (let j = 0; j < workinglist.length; j++) {
					let target = workinglist[j];
					if (!masterlist.includes(target)) {
						let portsbusted = 0
						if (ns.fileExists("BruteSSH.exe", "home")) {
							ns.brutessh(target);
							portsbusted++;
						}
						if (ns.fileExists("FTPCrack.exe", "home")) {
							ns.ftpcrack(target);
							portsbusted++;
						}
						if (ns.fileExists("relaySMTP.exe", "home")) {
							ns.relaysmtp(target);
							portsbusted++;
						}
						if (ns.fileExists("HTTPWorm.exe", "home")) {
							ns.httpworm(target);
							portsbusted++;
						}
						if (ns.fileExists("SQLInject.exe", "home")) {
							ns.sqlinject(target);
							portsbusted++;
						}
						if (ns.getServerNumPortsRequired(target) <= portsbusted) {
							ns.nuke(target);
						}
						if (ns.hasRootAccess(target)) {
							masterlist.push(target);
						}
					}
				}
			}
			masterlist = masterlist.slice(1);
			ns.print("updating RAM servers...");
			for (let i = 0; i < masterlist.length; i++) {
				let target = masterlist[i];
				if (!ramlist.includes(target)) {
					if (ns.getServerMaxRam(target) > 0) {
						ramlist.push(target);
						ns.scp("manhack.js", target);
						ns.scp("mangrow.js", target);
						ns.scp("manweaken.js", target);
					}
				}
			}
			ns.print("updating hack servers...");
			for (let i = 0; i < masterlist.length; i++) {
				let target = masterlist[i];
				if (!targetList.includes(target)) {
					if (ns.getServerRequiredHackingLevel(target) <= ns.getHackingLevel()) {
						if (ns.getServerMoneyAvailable(target) > 0) {
							targetList.push(target);
							moneyList.push(ns.getServerMaxMoney(target) * 0.75);
							securityList.push(ns.getServerMinSecurityLevel(target) + 5);
						}
					}
				}
			}
			ns.print("updating PID array...");
			for (let i = pidList.length; i < targetList.length; i++) {
				pidList.push(0);
				timerlist.push(0);
			}
			if (!formsexe) {
				ns.print("checking for Formulas.exe...");
				formsexe = ns.fileExists("Formulas.exe", "home");
				if (formsexe) {
					ns.print("Formulas.exe found! wiping subscripts and PID array...");
					for (let i = 0; i < masterlist.length; i++) {
						let target = masterlist[i];
						ns.scriptKill("manhack.js", target);
						ns.scriptKill("mangrow.js", target);
						ns.scriptKill("manweaken.js", target);
					}
					for (let i = 0; i < pidList.length; i++) {
						pidList[i] = 0;
					}
				}
			}
			loopcount = 0;
		} else {
			loopcount++;
			ns.print("loop count: " + loopcount);
		}
	}
}