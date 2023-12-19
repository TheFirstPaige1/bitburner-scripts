# bitburner-scripts
Scripts for BitBurner 2.5.1

Current scripts and their functions:
- bitlib - library script containing functions used in other scripts

- eval - runs any function passed to it as a string and prints the return value

- h4ckrnet - buys up as many hacknet nodes and upgrades as it can, always purchasing the cheapest first
- serverstager - buys as many private servers as possible at 2GB each, and then incrementally upgrades them in order until a limit is reached, pass a number as an argument to set a limit, now also automatically shares half the RAM where possible using the same method as servershare

- netscanner - creates a networkmap.txt containing an array of servers and the servers they were reached via, in pairs, to be used with a map script and a connect script, also copies .lit files to home
- connecter - currently just prints a network path to a server passed as an argument, might make it attempt connect() chains later on

- nettrawler - iterates over the network and hacks and backdoors as many as possible
- listaugs - prints to the log all unowned and faction available augments filtered by a list of desireable stats, awaiting further work
- ironpumper - automatically works out at powerhouse gym in sector-12 until all stats are at least a given number

- stockwatcher - automated stock market buyer/seller, doesn't require or use the 4S market data
- bailwse - kills stockwatcher and sells all stocks, for when you want to stop trading

- autoshurg - WIP automated corporation handler
- sharesbuyback - a script that'll automatically buy back as many shares as you can afford every minute until they're all purchased

- totalhack - a single-instance hack manager that dynamically allocates RAM and periodically updates as new servers are hackable, always run on home, relies on manhack subscript
- totalrestart - kills and restarts totalhack, or runs it if it doesn't exist yet

- servershare - a simple ram sharing script, kills all scripts running on purchased servers, distributes manshare to them, and run it using half maximum RAM
- manshare - awaited infinite loop of the share function, perfectly 4GB of RAM