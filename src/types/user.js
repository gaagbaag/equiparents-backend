/**
 * Representa la dirección asociada a un usuario
 * @typedef {Object} Address
 * @property {string} [country]
 * @property {string} [state]
 * @property {string} [city]
 * @property {string} [zipCode]
 * @property {string} [street]
 * @property {string} [number]
 * @property {string} [departmentNumber]
 */

/**
 * Representa un usuario extendido
 * @typedef {Object} ExtendedUser
 * @property {string} id
 * @property {string} email
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [phone]
 * @property {string} [countryCode]
 * @property {string} [role] // nombre del rol (admin o parent)
 * @property {string} [parentalAccountId]
 * @property {Address} [address]
 */
