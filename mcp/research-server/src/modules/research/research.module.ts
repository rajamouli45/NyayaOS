import { Module } from '@nitrostack/core';
import { ResearchTools } from './research.tools.js';
import { ResearchResources } from './research.resources.js';
import { ResearchPrompts } from './research.prompts.js';

@Module({
  name: 'research',
  description: 'Legal research and precedents service',
  controllers: [ResearchTools, ResearchResources, ResearchPrompts]
})
export class ResearchModule { }

