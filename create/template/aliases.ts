/*
 * key: name of alias, how it will be imported.
 *      example:
 *
 *      aliases = {
 *        pages: 'src/pages'
 *      }
 *
 *      can be used as: '@pages/{ ... }'
 *
 * value: path to directory relative to this directory
 */
const aliases: Record<string, string> = {};

export default aliases;
