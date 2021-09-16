import { main } from './main';

/* If command is executed without arguments show help page */
if (process.argv.length === 2) {
  process.argv.push('-h');
}

main(process.argv);
