# bitburner-scripts
Scripts for BitBurner 2.5.0

Current scripts and their functions:
- autodeploy - outdated and functionally replaced with totalrestart, will rework unto a unified script handler at Some PointTM
- hackman - deprecated, replaced with totalhack
- netscanner - outdated network trawler, awaiting a rewrite

- h4ckrnet - buys up as many hacknet nodes and upgrades as it can, always purchasing the cheapest first
- serverstager - buys as many private servers as possible at 2GB each, and then incrementally upgrades them in order until a limit is reached, pass a number as an argument to set a limit
- darkweb - buys the TOR browser and then each hacking program in turn, requires singularity api access

- sourcefiler - creates a txt file with the current source files owned, mostly a proof of concept for something else

- stockwatcher - automated stock market buyer/seller, doesn't require or use the 4S market data
- bailwse - kills stockwatcher and sells all stocks, for when you want to stop trading

- sharesbuyback - a script that'll automatically buy back as many shares as you can afford every minute until they're all purchased

- totalhack - a single-instance hack manager that dynamically allocates RAM and periodically updates as new servers are hackable, always run on home, relies on manhack, manweaken, and mangrow subscripts
- manhack, manweaken, mangrow - awaited single function subscripts that call a single use of their named function
- totalrestart - kills and restarts totalhack, or runs it if it doesn't exist yet
