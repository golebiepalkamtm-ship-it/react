const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const command = 'npx prisma migrate diff --from-empty --to-schema-datamodel server/prisma/schema.prisma --script';

exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        console.error(`stderr: ${stderr}`);
        return;
    }
    const outputPath = path.join('server', 'prisma', 'migrations', '0_init', 'migration.sql');
    fs.writeFileSync(outputPath, stdout);
    console.log(`Migration written to ${outputPath}`);
});
