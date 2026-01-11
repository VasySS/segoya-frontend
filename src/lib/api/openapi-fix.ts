import fs from 'node:fs';

const filePath = 'src/lib/api/openapi';

let specFile = fs.readFileSync(filePath, 'utf8');

// typed-openapi doesn't support z.file()
specFile = specFile.replace(
	/(")\/v1\/users\/avatar(":\s*put_UpdateUserAvatar,)/,
	"'use updateUserAvatar function in users.ts': put_UpdateUserAvatar"
);
fs.writeFileSync(filePath, specFile, 'utf8');

// eslint-disable-next-line no-console
console.info('✅ Removed PUT /v1/users/avatar from openapi.ts');
