import { TemplateLoaderService } from '../../utils/template-loader.service';
import * as Handlebars from 'handlebars';
import { EmailTemplateDataMap, EmailTemplates } from './email-templates.config';

const templateLoader = new TemplateLoaderService();
templateLoader.registerComponents();

export const compileTemplate = (
  templateId: EmailTemplates,
  data?: EmailTemplateDataMap[EmailTemplates],
): string => {
  const templateContent = templateLoader.loadTemplate(templateId);
  return Handlebars.compile(templateContent)(data);
};
