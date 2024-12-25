/**
 * Helper method to construct the expected handler method name based on channel and eventname.
 * Follows the convention: handleSubscription_{CapitalizedChannel}_{CapitalizedEventName}
 *
 * @param {string} channel - The channel name.
 * @param {string} eventname - The eventname name.
 *
 * @returns {string} - The constructed handler method name.
 *
 * @example
 * getHandleSubscriptionName("system", "start") => "handleSubscription_System_Start"
 */
function getHandleSubscriptionName(channel, eventName) {
    // Capitalize the first letter of channel and eventName
    const capitalizedChannel = channel.charAt(0).toUpperCase() + channel.slice(1)
    const capitalizedEventName = eventName.charAt(0).toUpperCase() + eventName.slice(1)
    return `handle${capitalizedChannel}${capitalizedEventName}`
}

export default getHandleSubscriptionName
