import { components } from './generated/openapi.js';

// Properly exporting types otherwise they are not accessible in the client

export type TaskGroupProperties =
  components['schemas']['TaskGroupProperties-Output'];

export type TaskGroup = Omit<
  components['schemas']['core__domain__tasks__task_group__TaskGroup'],
  'properties'
> & {
  properties: TaskGroupProperties;
};

export type RawTaskRun = Omit<
  components['schemas']['SerializableTaskRun'],
  'group'
> & {
  group: TaskGroup;
};
