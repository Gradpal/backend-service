import { PartialType } from '@nestjs/swagger';
import { CreateEditorDocumentDto } from './create-editor-document.dto';

export class UpdateEditorDocumentDto extends PartialType(
  CreateEditorDocumentDto,
) {}
