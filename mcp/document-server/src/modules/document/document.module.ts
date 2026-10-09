import { Module } from '@nitrostack/core';
import { DocumentTools } from './document.tools.js';
import { DocumentResources } from './document.resources.js';
import { DocumentPrompts } from './document.prompts.js';

@Module({
  name: 'document',
  description: 'Document verification service',
  controllers: [DocumentTools, DocumentResources, DocumentPrompts]
})
export class DocumentModule { }

