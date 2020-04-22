import { Service } from '@rxdi/core';
import { clearScreenDown, createInterface, ReadLine } from 'readline';

@Service()
export class ReadlineService {
  readline: ReadLine;
  private createReadlineInterface() {
    return createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }
  async clearScreenDown() {
    return clearScreenDown(process.stdin);
  }
  async createQuestion<T>(question: string, task: Function) {
    return new Promise((resolve) => {
      this.readline = this.createReadlineInterface();
      this.readline.question(question, (answer) => {
        try {
          task(answer);
        } catch (e) {
          console.error('Missing question internal library error!');
        }
        this.readline.close();
        resolve();
      });
    });
  }
}
