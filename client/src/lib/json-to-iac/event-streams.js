const { endComment } = require("./constants");
const { jsonToTf, kebabName, rgIdRef, buildTitleComment } = require("./utils");

/**
 * create event streams terraform
 * @param {Object} eventStreams
 * @param {string} eventStreams.name
 * @param {string} eventStreams.plan
 * @param {string} eventStreams.resource_group
 * @param {string} eventStreams.endpoints can be public private or public-and-private
 * @param {Array<string>} eventStreams.private_ip_allowlist
 * @param {string} eventStreams.throughput
 * @param {string} eventStreams.storage_size
 * @param {Object} config
 * @returns {string} terraform formatted string
 */
function formatEventStreams(eventStreams, config) {
  let eventStreamsValues = {
    name: kebabName(config, [eventStreams.name]),
    service: '"messagehub"',
    plan: `"${eventStreams.plan}"`,
    location: "$region",
    resource_group_id: rgIdRef(eventStreams.resource_group, config),
    "_parameters =": {
      "service-endpoints": `"${eventStreams.endpoints}"`
    },
    _timeouts: {
      create: '"3h"',
      update: '"1h"',
      delete: '"1h"'
    }
  };
  if (eventStreams.private_ip_allowlist) {
    eventStreamsValues[
      "_parameters ="
    ].private_ip_allowlist = `"${JSON.stringify(
      eventStreams.private_ip_allowlist
    ).replace(/\"/g, "")}"`; // remove quotes to match intended params
  }
  ["throughput", "storage_size"].forEach(field => {
    if (eventStreams[field]) {
      eventStreamsValues["_parameters ="][field] = `"${eventStreams[field]}"`;
    }
  });
  return jsonToTf(
    "ibm_resource_instance",
    `${eventStreams.name} es`,
    eventStreamsValues,
    config
  );
}
/**
 * format event streams tf
 * @param {Object} config
 * @param {Array<Object>} config.event_streams
 * @returns {string} terraform
 */
function eventStreamsTf(config) {
  let tf = buildTitleComment("event", "streams");
  config.event_streams.forEach(instance => {
    tf += formatEventStreams(instance, config);
  });
  return tf + endComment + "\n";
}

module.exports = {
  formatEventStreams,
  eventStreamsTf
};