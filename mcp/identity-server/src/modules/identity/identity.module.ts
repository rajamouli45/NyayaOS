import { Module } from '@nitrostack/core';
import { IdentityTools } from './identity.tools.js';
import { IdentityResources } from './identity.resources.js';
import { IdentityPrompts } from './identity.prompts.js';

@Module({
  name: 'identity',
  description: 'Identity verification service',
  controllers: [IdentityTools, IdentityResources, IdentityPrompts]
})
export class IdentityModule { }

