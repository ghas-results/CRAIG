const {
  splat,
  getObjectFromArray,
  isNullOrEmptyString,
  contains,
  containsKeys,
  splatContains,
  isEmpty
} = require("lazy-z");
const {
  newResourceNameExp,
  sshKeyValidationExp,
  commaSeparatedIpListExp,
  urlValidationExp
} = require("../constants");
const { hasDuplicateName } = require("./duplicate-name");

/**
 * check to see if a resource has a valid name
 * @param {string} str name
 * @returns {boolean} true if name is invalid
 */
function invalidNewResourceName(str) {
  return str.match(newResourceNameExp) === null;
}

/**
 * invalid tags
 * @param {Array<string>} tags
 * @returns {boolean} true if any tags in list are invalid
 */
function invalidTagList(tags) {
  if (tags.length === 0) return false;
  let invalid = false;
  tags.forEach(tag => {
    if (tag.match(newResourceNameExp) === null || tag.length > 128) {
      invalid = true;
    }
  });
  return invalid;
}

/**
 * create invalid bool for resource
 * @param {string} field json field name
 * @returns {Function} text should be invalid function
 */
function invalidName(field) {
  /**
   * create invalid for resource
   * @param {Object} stateData
   * @param {boolean} stateData.use_prefix
   * @param {Object} componentProps
   * @returns {string} invalid text
   */
  function nameCheck(stateData, componentProps, overrideField) {
    let stateField = overrideField || "name";
    if (containsKeys(stateData, "scope_description")) {
      // easiest way to get scc
      return (
        stateData[stateField] === "" ||
        invalidNewResourceName(stateData[stateField])
      );
    } else {
      return (
        hasDuplicateName(field, stateData, componentProps, overrideField) ||
        stateData[stateField] === "" ||
        (!stateData.use_data && invalidNewResourceName(stateData[stateField]))
      );
    }
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
        return invalidName("vpc_name")(stateData, componentProps);
      } else if (isNullOrEmptyString(stateData[field])) {
        return false;
      } else if (field === "default_network_acl_name") {
        return invalidName("acls")(stateData, componentProps, field);
      } else if (field === "default_security_group_name") {
        return invalidName("security_groups")(stateData, componentProps, field);
      } else {
        return invalidName("routing_tables")(stateData, componentProps, field);
      }
    };
  } else return nameCheck;
}

/**
 * invalid encryption key ring name
 * @param {Object} stateData
 * @param {string} stateData.key_ring
 * @return {boolean} true if invalid
 */
function invalidEncryptionKeyRing(stateData) {
  return (
    stateData.key_ring !== "" && invalidNewResourceName(stateData.key_ring)
  );
}

/**
 * validate sshKey
 * @param {string} str
 * @returns {boolean} true if it is a valid sshKey
 */
function validSshKey(str) {
  if (str === null) {
    return false;
  } else {
    return str.match(sshKeyValidationExp) !== null;
  }
}

/**
 * check if ssh key is invalid
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {Object} invalid boolean invalidText string
 */
function invalidSshPublicKey(stateData, componentProps) {
  let invalid = {
    invalid: false,
    invalidText:
      "Provide a unique SSH public key that does not exist in the IBM Cloud account in your region"
  };
  if (!validSshKey(stateData.public_key)) {
    invalid.invalid = true;
  } else if (
    // if public key already used
    contains(
      splat(componentProps.craig.store.json.ssh_keys, "public_key"),
      stateData.public_key
    )
  ) {
    let key = getObjectFromArray(
      componentProps.craig.store.json.ssh_keys,
      "public_key",
      stateData.public_key
    );
    if (componentProps.data.name === key.name) {
      return invalid; // This is the current key, escape
    } else {
      // duplicate key
      invalid.invalid = true;
      invalid.invalidText = "SSH Public Key in use";
    }
  }
  return invalid;
}

/**
 * check if subnet tier name is invalid
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true if invalid
 */
function invalidSubnetTierName(stateData, componentProps) {
  return (
    (splatContains(
      componentProps.craig.store.subnetTiers[componentProps.vpc_name],
      "name",
      stateData.name
    ) &&
      stateData.name !== componentProps.data.name) ||
    invalidNewResourceName(stateData.name)
  );
}

/**
 * check if iam account setting is invalid
 * @param {string} field
 * @param {Object} stateData
 * @returns {boolean} true if invalid
 */
function invalidIamAccountSettings(field, stateData) {
  return (
    field === "max_sessions_per_identity" &&
    (stateData.max_sessions_per_identity < 1 ||
      stateData.max_sessions_per_identity > 10)
  );
}

function invalidF5Vsi(field, stateData, componentProps) {
  let hasOwnValidation = ["tmos_admin_password"];
  let optionalFields = [
    "app_id",
    "license_password",
    "license_unit_of_measure"
  ];
  if (
    field.includes("url") || // all url fields have their own validation
    contains(hasOwnValidation, field) ||
    contains(optionalFields, field)
  ) {
    return false; // ignore these, have their own validation
  } else {
    return isNullOrEmptyString(stateData[field]); // just cannot be empty
  }
}

/**
 * check if security group rule name is invalid
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true if invalid
 */
function invalidSecurityGroupRuleName(stateData, componentProps) {
  let duplicateRuleName = false;
  let ruleRef = componentProps.isModal
    ? componentProps.rules
    : componentProps.innerFormProps.rules;
  if (stateData.name !== componentProps.data.name) {
    duplicateRuleName = splatContains(ruleRef, "name", stateData.name);
  }
  return duplicateRuleName || invalidNewResourceName(stateData.name);
}

/**
 * check if string of comma separated ips is invalid
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true if invalid
 */
function invalidIpCommaList(ipList) {
  if (isNullOrEmptyString(ipList)) {
    return false;
  } else return ipList.match(commaSeparatedIpListExp) === null;
}

function invalidIdentityProviderURI(stateData, componentProps) {
  return !(stateData.identity_provider.length >= 6);
}

/**
 * url value is valid and not empty
 * @param {str} url
 * @returns {boolean} true when url is valid (ie, null, "null", or a valid url), otherwise false
 */
function isValidUrl(url) {
  if (isNullOrEmptyString(url) || url === "null") return true;
  return url.match(urlValidationExp) !== null;
}

/**
 * test if list of crns is valid
 * @param {Array} crnList list of crns
 * @returns true if list of crns is valid
 */
function invalidCrnList(crnList) {
  if (crnList === undefined || isEmpty(crnList)) {
    return false;
  }

  const crnRegex = /^(crn:v1:bluemix:(public|dedicated|local):)[A-z-:/0-9]+$/i;
  let isInvalid = false;
  crnList.forEach(crn => {
    if (crn.match(crnRegex) === null) {
      isInvalid = true
    }
  })

  return isInvalid
}

module.exports = {
  invalidName,
  invalidNewResourceName,
  invalidEncryptionKeyRing,
  invalidSshPublicKey,
  invalidTagList,
  invalidCrnList,
  validSshKey,
  invalidSubnetTierName,
  invalidIamAccountSettings,
  invalidSecurityGroupRuleName,
  invalidIpCommaList,
  invalidIdentityProviderURI,
  invalidF5Vsi,
  isValidUrl
};
