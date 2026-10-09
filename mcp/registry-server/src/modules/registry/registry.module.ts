import { Module } from '@nitrostack/core';
import { RegistryTools } from './registry.tools.js';
import { RegistryResources } from './registry.resources.js';
import { RegistryPrompts } from './registry.prompts.js';

@Module({
  name: 'registry',
  description: 'Registry authentication and audit service',
  controllers: [RegistryTools, RegistryResources, RegistryPrompts]
})
export class RegistryModule { }

