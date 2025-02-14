import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';

export class TemplateLoaderService {
  private readonly componentsDir: string;
  private readonly emailTemplatesDir: string;

  constructor() {
    this.componentsDir = path.join(
      process.cwd(),
      'assets/templates/email/components',
    );
    this.emailTemplatesDir = path.join(
      process.cwd(),
      'assets/templates/email/emails',
    );
  }

  /**
   * Registers Handlebars partials by reading files from the components directory.
   * Only files with a '.hbs' extension are registered as components.
   */
  registerComponents(): void {
    try {
      const componentFiles = fs.readdirSync(this.componentsDir);
      componentFiles.forEach((file) => {
        if (file.endsWith('.hbs')) {
          const componentName = path.parse(file).name;
          const componentContent = fs.readFileSync(
            path.join(this.componentsDir, file),
            'utf-8',
          );
          Handlebars.registerPartial(componentName, componentContent);
        }
      });
    } catch (error) {
      Logger.error('Error registering components:', error);
    }
  }

  loadTemplate(templateName: string): string {
    try {
      return fs.readFileSync(
        path.join(this.emailTemplatesDir, `${templateName}.hbs`),
        'utf-8',
      );
    } catch (error) {
      Logger.error(`Error loading template "${templateName}":`, error);
      throw error;
    }
  }
}
