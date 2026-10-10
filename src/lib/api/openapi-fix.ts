import fs from 'node:fs';

const filePath = 'src/lib/api/openapi.ts';

let specFile = fs.readFileSync(filePath, 'utf8');

// Avatar uploads require FormData and use updateUserAvatar in users.ts.
specFile = specFile.replace(
	/"\/v1\/users\/avatar"(?=:\s*put_UpdateUserAvatar\b)/,
	"'use updateUserAvatar function in users.ts'"
);
fs.writeFileSync(filePath, specFile, 'utf8');

// eslint-disable-next-line no-console
console.info('✅ Removed PUT /v1/users/avatar from openapi.ts');
