import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  const target = ns.args[0] as string;
  const moneyThresh = ns.getServerMaxMoney(target) * 0.75;
  const securityThresh = ns.getServerMinSecurityLevel(target) + 5;
  const masterlist = ns.read("masterlist.txt").split(",");
  const formsexe = ns.fileExists("Formulas.exe", "home");
  while (ns.getHackingLevel() > ns.getServerRequiredHackingLevel(target)) {
    let mostfreeram = 0;
    let mastindex = 0;
    let scripthome = masterlist[mastindex];
    while (mastindex < masterlist.length) {
      let freeram = ns.getServerMaxRam(masterlist[mastindex]) - ns.getServerUsedRam(masterlist[mastindex]);
      if (freeram > mostfreeram) {
        mostfreeram = freeram;
        scripthome = masterlist[mastindex];
      }
      mastindex++;
    }
    let maxthreads = Math.trunc(mostfreeram / 2);
    if (ns.getServerSecurityLevel(target) > securityThresh) {
      let weakengoal = ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target);
      let threadcount = 1;
      while (ns.weakenAnalyze(threadcount) < weakengoal) {
        threadcount++;
      }
      threadcount = Math.min(threadcount, maxthreads);
      ns.scp("manweaken.js", scripthome, "home");
      if (formsexe) {
        let timetil = ns.formulas.hacking.weakenTime(ns.getServer(target), ns.getPlayer());
        ns.exec("manweaken.js", scripthome, threadcount, target);
        ns.print("weakening " + target + " for " + Math.trunc(timetil) + "ms");
        ns.print("on " + scripthome + " with " + threadcount + " threads");
        await ns.sleep(timetil);
      } else {
        let scriptpid = ns.exec("manweaken.js", scripthome, threadcount, target);
        ns.print("weakening " + target + " with " + threadcount + " threads on " + scripthome);
        while (ns.isRunning(scriptpid)) {
          await ns.sleep(5000);
        }
      }
    } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
      let threadcount = 1;
      if (formsexe) {
        threadcount = ns.formulas.hacking.growThreads(ns.getServer(target), ns.getPlayer(), Infinity);
      } else {
        let growthgoal = ns.getServerMaxMoney(target) / ns.getServerMoneyAvailable(target);
        threadcount = Math.ceil(ns.growthAnalyze(target, growthgoal));
      }
      threadcount = Math.min(maxthreads, threadcount);
      ns.scp("mangrow.js", scripthome, "home");
      if (formsexe) {
        let timetil = ns.formulas.hacking.growTime(ns.getServer(target), ns.getPlayer());
        ns.exec("mangrow.js", scripthome, threadcount, target);
        ns.print("growing " + target + " for " + Math.trunc(timetil) + "ms");
        ns.print("on " + scripthome + " with " + threadcount + " threads");
        await ns.sleep(timetil);
      } else {
        let scriptpid = ns.exec("mangrow.js", scripthome, threadcount, target);
        ns.print("growing " + target + " with " + threadcount + " threads on " + scripthome);
        while (ns.isRunning(scriptpid)) {
          await ns.sleep(5000);
        }
      }
    } else {
      let hackgoal = ns.getServerMaxMoney(target) - moneyThresh;
      let threadcount = Math.ceil(ns.hackAnalyzeThreads(target, hackgoal));
      threadcount = Math.min(threadcount, maxthreads);
      ns.scp("manhack.js", scripthome, "home");
      if (formsexe) {
        let timetil = ns.formulas.hacking.hackTime(ns.getServer(target), ns.getPlayer());
        ns.exec("manhack.js", scripthome, threadcount, target);
        ns.print("hacking " + target + " for " + Math.trunc(timetil) + "ms");
        ns.print("on " + scripthome + " with " + threadcount + " threads");
        await ns.sleep(timetil);
      } else {
        let scriptpid = ns.exec("manhack.js", scripthome, threadcount, target);
        ns.print("hacking " + target + " with " + threadcount + " threads on " + scripthome);
        while (ns.isRunning(scriptpid)) {
          await ns.sleep(5000);
        }
      }
    }
  }
}