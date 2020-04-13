/* eslint-disable @typescript-eslint/no-var-requires */
import { Container, Service } from '@rxdi/core';

import { ReadlineService } from '../core/services/readline.service';

const chalk = require('chalk');
const Spinner = require('cli-spinner').Spinner;

function strEnum<T extends string>(o: Array<T>): { [K in T]: K } {
  return o.reduce((res, key) => {
    res[key] = key;
    return res;
  }, Object.create(null));
}

export const QuestionsType = strEnum(['username', 'password', 'project']);
export type QuestionsType = keyof typeof QuestionsType;

class UserConfig {
  username: string;
  password: string;
  project: string;
}

export interface Questions {
  passwordQuestion(): void;
  projectQuestion(): void;
  usernameQuestion(): void;
}
export interface Tasks {
  usernameTask(username: string): void;
  projectTask(name: string): void;
  passwordTask(password: string): void;
}

@Service()
export class DeployTask implements Tasks, Questions {
  private readlineService: ReadlineService = Container.get(ReadlineService);
  private deploy_config: UserConfig = new UserConfig();

  spinner = new Spinner();
  async run() {
    this.spinner.setSpinnerString(17);
    try {
      await this.usernameQuestion();
      await this.passwordQuestion();
      await this.projectQuestion();
      console.log('Deploy Success!');
    } catch (e) {
      console.log('Deploy Error!');
    }
    process.exit(0);
  }

  async passwordQuestion() {
    await this.readlineService.createQuestion(
      'Password: ',
      this.passwordTask.bind(this)
    );
    await this.validateUserConfig(QuestionsType.password);
  }

  async projectQuestion() {
    await this.readlineService.createQuestion(
      'Project name: ',
      this.projectTask.bind(this)
    );
    await this.validateUserConfig(QuestionsType.project);
  }

  async usernameQuestion() {
    await this.readlineService.createQuestion(
      'Username: ',
      this.usernameTask.bind(this)
    );
    await this.validateUserConfig(QuestionsType.username);
  }

  usernameTask(username: string) {
    this.deploy_config.username = username;
  }

  projectTask(name: string) {
    this.deploy_config.project = name;
  }

  passwordTask(password: string) {
    this.deploy_config.password = password;
  }

  async validateUserConfig(question: QuestionsType) {
    process.stdout.write(`\x1B[2J`);
    process.stdout.write(
      `Current configuration: ${JSON.stringify(
        this.deploy_config,
        null,
        4
      )} \n\n\n\n\n`
    );
    if (!this.deploy_config[question]) {
      console.log(
        chalk.red(`Missing ${question} please fill your ${question}!`)
      );
      await this[`${question}Question`]();
      await this.validateUserConfig(question);
    }
  }
}
