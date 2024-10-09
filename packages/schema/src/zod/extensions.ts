import { DATETIME_LOCAL } from '../atoms/datetime-local.js';
import { FILE } from '../atoms/file.js';
import { IMAGE } from '../atoms/image.js';

/**
 * The schema for an image
 *
 * @returns The schema for an image
 */
export const image = () => IMAGE;

/**
 * The schema for a datetime in the input
 *
 * @returns The schema for a datetime in the input
 */
export const datetimeLocal = () => DATETIME_LOCAL;

/**
 * The schema for a file
 *
 * @returns The schema for a file
 */
export const file = () => FILE;
