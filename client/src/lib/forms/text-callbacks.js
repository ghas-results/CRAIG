const { isNullOrEmptyString } = require("lazy-z");
const { newResourceNameExp } = require("../constants");
const { hasDuplicateName } = require("./duplicate-name");

/**
 * create helper text for resource group name
 * @param {Object} stateData
 * @param {boolean} stateData.use_prefix
 * @param {Object} componentProps
 * @param {Object} componentProps.craig
 * @param {Object} componentProps.craig.store
 * @param {Object} componentProps.craig.store.json
 * @param {Object} componentProps.craig.store.json._options
 * @param {string} componentProps.craig.store.json._options.prefix
 * @returns {string} composed resource group name
 */
function resourceGroupHelperTextCallback(stateData, componentProps) {
  return (
    (stateData.use_prefix
      ? componentProps.craig.store.json._options.prefix + "-"
      : "") + stateData.name
  );
}

/**
 * create generic name callback for most use cases
 * @return {string} invalid message
 */
function genericNameCallback() {
  return `Name must follow the regex pattern: ${newResourceNameExp}`;
}

/**
 * create generic callback for duplicate name
 * @param {string} name resource name
 * @returns {string} invalid message
 */
function duplicateNameCallback(name) {
  return `Name "${name}" already in use`;
}

/**
 * create invalid text
 * @param {string} field json field name
 * @returns {Function} text should be invalid function
 */
function invalidNameText(field) {
  /**
   * create invalid text for name
   * @param {Object} stateData
   * @param {boolean} stateData.use_prefix
   * @param {Object} componentProps
   * @returns {string} invalid text
   */
  function nameText(stateData, componentProps, overrideField) {
    if (hasDuplicateName(field, stateData, componentProps, overrideField)) {
      return duplicateNameCallback(stateData[overrideField || "name"]);
    } else return genericNameCallback();
  }
  if (field === "vpcs") {
    /**
     * invalid vpc field check
     * @param {string} field name
     * @param {Object} stateData
     * @param {Object} componentProps
     */
    return function(field, stateData, componentProps) {
      if (field === "name") {
        return invalidNameText("vpc_name")(stateData, componentProps);
      } else if (isNullOrEmptyString(stateData[field])) {
        return "";
      } else if (field === "default_network_acl_name") {
        return invalidNameText("acls")(stateData, componentProps, field);
      } else if (field === "default_security_group_name") {
        return invalidNameText("security_groups")(
          stateData,
          componentProps,
          field
        );
      } else {
        return invalidNameText("routing_tables")(
          stateData,
          componentProps,
          field
        );
      }
    };
  } else return nameText;
}

/**
 * get cos resource helper text
 * @param {*} stateData
 * @returns {string} composed helper text
 */
function cosResourceHelperTextCallback(stateData, componentProps) {
  return `${
    stateData.use_data
      ? ""
      : componentProps.craig.store.json._options.prefix + "-"
  }${stateData.name}${stateData.use_random_suffix ? "-<random-suffix>" : ""}`;
}

module.exports = {
  resourceGroupHelperTextCallback,
  genericNameCallback,
  duplicateNameCallback,
  invalidNameText,
  cosResourceHelperTextCallback
};
