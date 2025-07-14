const axios = require('axios');
const fs = require('node:fs/promises');

const sources = [
	'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/main/allowlist.conf',
	'https://raw.githubusercontent.com/unkn0w/disposable-email-domain-list/main/domains.txt',
	'https://raw.githubusercontent.com/disposable/disposable-email-domains/master/domains.txt',
	'https://raw.githubusercontent.com/wesbos/burner-email-providers/master/emails.txt',
];

const isValidDomain = domain =>
	(/^(?!-)(?!.*\.\.)(?!.*\.-)(?!.*-\.)[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/).test(domain);

const fetchDomains = async url => {
	console.log('Downloading...', url);

	try {
		const response = await axios.get(url);
		return response.data
			.split('\n')
			.map(line => line.trim().toLowerCase())
			.filter(line => line && !line.startsWith('#') && isValidDomain(line));
	} catch (err) {
		console.error(`Failed to fetch ${url}: ${err.message}`);
		return [];
	}
};

(async () => {
	let totalCollected = 0;
	const uniqueDomains = new Set();

	for (const url of sources) {
		const domains = await fetchDomains(url);
		totalCollected += domains.length;
		for (const domain of domains) uniqueDomains.add(domain);
	}

	console.log('Writing files...');
	const totalUnique = uniqueDomains.size;
	await fs.writeFile('blacklist.txt', [...uniqueDomains].sort().join('\n'));

	console.log('\nDomain List Statistics\n================================');
	console.log(`Total domains collected : ${totalCollected}`);
	console.log(`Unique domains          : ${totalUnique}`);
	console.log(`Duplicates removed      : ${totalCollected - totalUnique}`);
})();