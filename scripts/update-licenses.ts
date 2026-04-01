import fs from 'node:fs';
import path from 'node:path';

import { init } from 'license-checker-rseidelsohn';

interface PackageJson {
  name: string;
}

interface LicenseInfo {
  licenses?: string | string[];
  licenseFile?: string;
}

interface UnreferencedFile {
  pkgName: string;
  path: string;
}

interface Spinner {
  succeed: (msg: string) => void;
  fail: (msg: string) => void;
}

const myPkgPath = path.resolve(process.cwd(), 'package.json');
const myPkg = JSON.parse(fs.readFileSync(myPkgPath, 'utf-8')) as PackageJson;
const myProjectName = myPkg.name;

const mainReadmePath = path.resolve(process.cwd(), 'README.md');
const readmeContent = fs.existsSync(mainReadmePath) ? fs.readFileSync(mainReadmePath, 'utf-8') : '';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  bgGreen: '\x1b[42m',
  black: '\x1b[30m',
} as const;

type ColorKey = keyof typeof colors;

const c = (color: ColorKey, text: string | number): string =>
  `${colors[color]}${text}${colors.reset}`;
const cb = (color: ColorKey, text: string | number): string =>
  `${colors.bold}${colors[color]}${text}${colors.reset}`;

function createSpinner(text: string): Spinner {
  const frames = ['-', '\\', '|', '/'];
  let i = 0;
  const timer = setInterval(() => {
    process.stdout.write(`\r[${cb('cyan', frames[i])}] ${text}`);
    i = (i + 1) % frames.length;
  }, 100);

  return {
    succeed: (msg: string): void => {
      clearInterval(timer);
      process.stdout.write(`\r[${cb('green', 'DONE')}] ${msg}${' '.repeat(text.length)}\n`);
    },
    fail: (msg: string): void => {
      clearInterval(timer);
      process.stdout.write(`\r[${cb('red', 'FAIL')}] ${msg}${' '.repeat(text.length)}\n`);
    },
  };
}

const logo = `
   ,--,
,---.'|
|   | :
:   : |     ,--,
|   ' :   ,--.'|         ,---,
;   ; '   |  |,      ,-+-. /  |
'   | |__ \`--'_     ,--.'|'   |
|   | :.'|,' ,'|   |   |  ,"' |
'   :    ;'  | |   |   | /  | |
|   |  ./ |  | :   |   | |  | |
;   : ;   '  : |__ |   | |  |/
|   ,/    |  | '.'||   | |--'
'---'     ;  :    ;|   |/
          |  ,   / '---'
           ---\`-'
`;

console.log(cb('magenta', logo));
console.log(c('cyan', '[INFO] Initialization started...\n'));

const targetNpmDir = path.resolve(process.cwd(), 'public/licenses/npm');
const targetManualDir = path.resolve(process.cwd(), 'public/licenses/manual');

if (fs.existsSync(targetNpmDir)) {
  fs.rmSync(targetNpmDir, { recursive: true, force: true });
}
fs.mkdirSync(targetNpmDir, { recursive: true });

if (!fs.existsSync(targetManualDir)) {
  fs.mkdirSync(targetManualDir, { recursive: true });
}

const spinner = createSpinner('Scanning dependencies and analyzing references...');

init({ start: process.cwd() }, (err: Error | null, packages: Record<string, LicenseInfo>) => {
  if (err) {
    spinner.fail(cb('red', 'Failed to retrieve licenses.'));
    console.error(c('red', err.message));
    process.exit(1);
  }

  let count = 0;
  const unreferencedFiles: UnreferencedFile[] = [];

  for (const [pkgInfoKey, info] of Object.entries(packages)) {
    const lastAtIdx = pkgInfoKey.lastIndexOf('@');
    const pkgName = lastAtIdx > 0 ? pkgInfoKey.substring(0, lastAtIdx) : pkgInfoKey;

    if (pkgName === myProjectName) continue;

    const safePkgName = pkgName.replace(/^@/, '').replace(/\//g, '-');

    const licenseType = Array.isArray(info.licenses)
      ? info.licenses.join('-')
      : (info.licenses ?? 'Unknown');

    const safeLicenseType = licenseType.replace(/\s+/g, '-').replace(/[^\w.-]/g, '');
    const fileName = `${safeLicenseType}-${safePkgName}.txt`;

    let licenseText: string;

    if (typeof info.licenseFile === 'string' && fs.existsSync(info.licenseFile)) {
      licenseText = fs.readFileSync(info.licenseFile, 'utf-8');

      const corruptedRegex =
        /Package: .*\nLicense: .*\nRepository: .*\nPublisher: .*\n+----------------------------------------------------------\n+/g;
      licenseText = licenseText.replace(corruptedRegex, '');
    } else {
      licenseText = '(No license file provided. Please refer to the repository.)\n';
    }

    const relativeFilePath = `public/licenses/npm/${fileName}`;
    fs.writeFileSync(path.join(targetNpmDir, fileName), licenseText, 'utf-8');
    count++;

    if (!readmeContent.includes(relativeFilePath)) {
      unreferencedFiles.push({
        pkgName,
        path: relativeFilePath,
      });
    }
  }

  spinner.succeed('Dependencies scanned and pure text files generated.');

  console.log(
    '\n' +
      colors.bgGreen +
      colors.black +
      colors.bold +
      ' DONE ' +
      colors.reset +
      ` Processed ${cb('yellow', count)} NPM packages.`,
  );

  if (unreferencedFiles.length > 0) {
    console.log(
      c(
        'yellow',
        `\n[WARN] Found ${cb('red', unreferencedFiles.length)} license files NOT strictly referenced in README.md:`,
      ),
    );
    unreferencedFiles.forEach((file) => {
      console.log(`  - ${cb('cyan', file.pkgName.padEnd(30, ' '))} -> ./${file.path}`);
    });
  } else {
    console.log(
      c(
        'green',
        `\n[PERFECT] All generated license files are perfectly referenced in your README.md!`,
      ),
    );
  }

  console.log();
});
