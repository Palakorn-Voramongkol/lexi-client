// src/utils/mergeSpecs.js

/**
 * Merges two subscription specifications into a single specification.
 * This function ensures that subscriptions for the same channel are combined,
 * and duplicate events within the same channel are avoided.
 *
 * @param {Object} spec1 - The first subscription specification.
 * @param {Object} spec2 - The second subscription specification.
 *
 * @returns {Object|null} - The merged subscription specification or null if both inputs are null/undefined.
 *
 * @example
 * const specA = {
 *   subscriptions: [
 *     {
 *       channel: "system",
 *       events: [
 *         { name: "start", description: "Start event", dataFormat: { timestamp: "string" } }
 *       ]
 *     }
 *   ]
 * };
 *
 * const specB = {
 *   subscriptions: [
 *     {
 *       channel: "system",
 *       events: [
 *         { name: "stop", description: "Stop event", dataFormat: { timestamp: "string" } },
 *         { name: "start", description: "Duplicate start event", dataFormat: { timestamp: "string" } }
 *       ]
 *     }
 *   ]
 * };
 *
 * const mergedSpec = mergeSubscriptionSpecs(specA, specB);
 * console.log(mergedSpec);
 * // Output:
 * // {
 * //   subscriptions: [
 * //     {
 * //       channel: "system",
 * //       events: [
 * //         { name: "start", description: "Start event", dataFormat: { timestamp: "string" } },
 * //         { name: "stop", description: "Stop event", dataFormat: { timestamp: "string" } }
 * //       ]
 * //     }
 * //   ]
 * // }
 */
function mergeSubscriptionSpecs(spec1, spec2) {
    // If both are null, undefined, or have empty subscriptions
    if (
        (!spec1 || !spec1.subscriptions || spec1.subscriptions.length === 0) &&
        (!spec2 || !spec2.subscriptions || spec2.subscriptions.length === 0)
    ) {
        return [] // Both are invalid or empty
    }

    // If spec1 is null, undefined, or has empty subscriptions
    if (!spec1 || !spec1.subscriptions || spec1.subscriptions.length === 0) {
        return spec2 // Return spec2
    }

    // If spec2 is null, undefined, or has empty subscriptions
    if (!spec2 || !spec2.subscriptions || spec2.subscriptions.length === 0) {
        return spec1 // Return spec1
    }

    // Initialize the merged specification with an empty subscriptions array
    const merged = { subscriptions: [] }

    // Create a Map to hold channels and their corresponding subscription details
    const channelMap = new Map()

    /**
     * Helper function to merge two arrays of events.
     * Ensures that events with the same name are not duplicated.
     *
     * @param {Array} events1 - The first array of event objects.
     * @param {Array} events2 - The second array of event objects.
     *
     * @returns {Array} - The merged array of unique event objects.
     */
    function mergeEvents(events1, events2) {
        const eventMap = new Map()

        // Add all events from the first specification to the eventMap
        events1.forEach((event) => eventMap.set(event.name, event))

        // Add events from the second specification only if they don't already exist
        events2.forEach((event) => {
            if (!eventMap.has(event.name)) {
                eventMap.set(event.name, event)
            }
        })

        // Return the array of unique events
        return Array.from(eventMap.values())
    }

    // Add subscriptions from the first specification to the channelMap
    spec1.subscriptions.forEach((subscription) => {
        channelMap.set(subscription.channel, { ...subscription })
    })

    // Merge subscriptions from the second specification
    spec2.subscriptions.forEach((subscription) => {
        if (channelMap.has(subscription.channel)) {
            const existingSubscription = channelMap.get(subscription.channel)

            // Merge events for the existing channel
            existingSubscription.events = mergeEvents(existingSubscription.events || [], subscription.events || [])

            // Update the channelMap with the merged events
            channelMap.set(subscription.channel, existingSubscription)
        } else {
            // If the channel does not exist, add it directly to the channelMap
            channelMap.set(subscription.channel, { ...subscription })
        }
    })

    // Build the merged subscriptions array from the channelMap values
    merged.subscriptions = Array.from(channelMap.values())

    return merged
}

/**
 * Merges two publication specifications into a single specification.
 * This function ensures that publications with the same channel and event are not duplicated.
 *
 * @param {Object} spec1 - The first publication specification.
 * @param {Object} spec2 - The second publication specification.
 *
 * @returns {Object} - The merged publication specification, or an empty object if both inputs are null/undefined.
 *
 * @example
 * const specA = {
 *   publications: [
 *     { channel: "system", event: "start", description: "Start event", condition: "Always", dataFormat: { timestamp: "string" }, exampleData: { timestamp: "2023-10-10T10:00:00Z" } }
 *   ]
 * };
 *
 * const specB = {
 *   publications: [
 *     { channel: "system", event: "stop", description: "Stop event", condition: "Always", dataFormat: { timestamp: "string" }, exampleData: { timestamp: "2023-10-10T10:05:00Z" } },
 *     { channel: "system", event: "start", description: "Duplicate start event", condition: "Always", dataFormat: { timestamp: "string" }, exampleData: { timestamp: "2023-10-10T10:00:00Z" } }
 *   ]
 * };
 *
 * const mergedSpec = mergePublicationSpecs(specA, specB);
 * console.log(mergedSpec);
 * // Output:
 * // {
 * //   publications: [
 * //     { channel: "system", event: "start", description: "Start event", condition: "Always", dataFormat: { timestamp: "string" }, exampleData: { timestamp: "2023-10-10T10:00:00Z" } },
 * //     { channel: "system", event: "stop", description: "Stop event", condition: "Always", dataFormat: { timestamp: "string" }, exampleData: { timestamp: "2023-10-10T10:05:00Z" } }
 * //   ]
 * // }
 */
function mergePublicationSpecs(spec1, spec2) {
    // Return an empty specification if both inputs are invalid
    if (!spec1 && !spec2) return { publications: [] }

    // Initialize the merged specification
    const merged = { publications: [] }

    // Handle cases where only one specification is valid
    const publications1 = spec1?.publications || []
    const publications2 = spec2?.publications || []

    // Create a Map to track unique publications based on channel and event
    const publicationMap = new Map()

    // Helper function to generate a unique key for each publication
    const getPublicationKey = (publication) => `${publication.channel}-${publication.event}`

    // Add publications from the first specification
    publications1.forEach((publication) => {
        const key = getPublicationKey(publication)
        publicationMap.set(key, { ...publication })
    })

    // Add publications from the second specification, avoiding duplicates
    publications2.forEach((publication) => {
        const key = getPublicationKey(publication)
        if (!publicationMap.has(key)) {
            publicationMap.set(key, { ...publication })
        }
    })

    // Populate the merged publications array
    merged.publications = Array.from(publicationMap.values())

    return merged
}

// Export the utility functions for use in other modules
export { mergePublicationSpecs, mergeSubscriptionSpecs }
